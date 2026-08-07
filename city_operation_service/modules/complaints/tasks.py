import os
import logging
import httpx
from config import settings
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from database import SessionLocal
from modules.complaints.model import Complaint, ComplaintMediaStatus
from core.s3 import upload_file_to_s3, generate_presigned_url

logger = logging.getLogger(__name__)

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=5,
)
def upload_complaint_media_task(self, complaint_id: int, temp_file_path: str, original_filename: str):
    """
    Celery task to upload complaint media to Amazon S3.
    """
    logger.info(f"Starting media upload task for complaint ID {complaint_id}, temp path: {temp_file_path}")
    db = SessionLocal()
    is_retrying = False
    
    try:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            logger.error(f"Complaint with ID {complaint_id} not found in database.")
            # Nothing to update if complaint record is missing, delete temp file if exists
            return

        # 1. Idempotency Guard:
        # First check if the complaint's media status is already MEDIA_READY
        if complaint.media_status == ComplaintMediaStatus.READY.value:
            logger.info(f"Complaint {complaint_id} media is already uploaded (MEDIA_READY). Skipping task execution.")
            return

        # Check if local temp file exists
        if not os.path.exists(temp_file_path):
            logger.error(f"Local temporary file not found at {temp_file_path}.")
            complaint.media_status = ComplaintMediaStatus.FAILED.value
            db.commit()
            return

        # 2. Perform S3 upload
        logger.info(f"Uploading file {original_filename} from {temp_file_path} to S3...")
        with open(temp_file_path, "rb") as file_obj:
            file_url = upload_file_to_s3(file_obj, folder="complaints", filename=original_filename)

        # 3. Update database record
        logger.info(f"Upload successful. S3 URL: {file_url}. Updating complaint {complaint_id} status to MEDIA_READY.")
        complaint.image_url = file_url
        complaint.media_status = ComplaintMediaStatus.READY.value
        db.commit()

        try:
            from modules.water_management.model import WaterComplaint
            water_comp = db.query(WaterComplaint).filter(WaterComplaint.title == complaint.title, WaterComplaint.citizen_id == complaint.reported_by).first()
            if water_comp:
                water_comp.before_image = file_url
                db.commit()
        except Exception as _e:
            logger.warning(f"Could not sync media to WaterComplaint: {_e}")

        try:
            from modules.waste_management.model import WasteComplaint
            from sqlalchemy import or_
            waste_comp = db.query(WasteComplaint).filter(
                or_(
                    WasteComplaint.id == complaint.id,
                    (WasteComplaint.title == complaint.title) & (WasteComplaint.citizen_id == complaint.reported_by)
                )
            ).first()
            if waste_comp:
                waste_comp.before_image = file_url
                db.commit()
        except Exception as _e:
            logger.warning(f"Could not sync media to WasteComplaint: {_e}")

        # Trigger AI classification and routing
        try:
            logger.info(f"Triggering AI routing background task for complaint ID {complaint_id}")
            classify_and_route_complaint_task.delay(complaint_id)
        except Exception as ai_err:
            logger.error(f"Failed to queue AI routing task: {ai_err}")
    except Exception as exc:
        logger.error(f"Exception occurred while uploading media for complaint {complaint_id}: {exc}", exc_info=True)
        try:
            is_retrying = True
            logger.info(f"Retrying task for complaint {complaint_id} (retry {self.request.retries + 1}/{self.max_retries})")
            raise self.retry(exc=exc)
        except Exception as retry_exc:
            # If the retry failed because max retries are exceeded
            if isinstance(retry_exc, MaxRetriesExceededError):
                logger.error(f"Max retries exceeded for complaint {complaint_id}. Setting media status to MEDIA_FAILED.")
                is_retrying = False
                
                # Update DB status to FAILED in a separate transaction to ensure DB consistency
                db_fail = SessionLocal()
                try:
                    c = db_fail.query(Complaint).filter(Complaint.id == complaint_id).first()
                    if c:
                        c.media_status = ComplaintMediaStatus.FAILED.value
                        db_fail.commit()
                finally:
                    db_fail.close()
                raise retry_exc
            raise retry_exc
            
    finally:
        db.close()
        # 4. Retry-safe cleanup of the temporary file in the finally block
        # Only clean up if we are NOT retrying (i.e. on success or when all retries are exhausted)
        if not is_retrying:
            if os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                    logger.info(f"Successfully cleaned up temporary file: {temp_file_path}")
                except Exception as cleanup_err:
                    logger.warning(f"Failed to delete temporary file {temp_file_path}: {cleanup_err}")


ISSUE_TO_DEPARTMENT_MAP = {
    "pothole": "traffic",
    "broken_traffic_signal": "traffic",
    "illegal_parking": "traffic",
    "garbage_accumulation": "waste",
    "sewage_overflow": "waste",
    "water_leak": "water",
    "broken_hydrant": "water",
    "street_light_issue": "general",
    "accident": "traffic",  # Temporary mapping until Emergency module is implemented
    "other": "general"
}

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=10,
)
def classify_and_route_complaint_task(self, complaint_id: int):
    """
    Celery task to call the AI Service and route a complaint based on the classified issue.
    """
    logger.info(f"Starting AI classification and routing task for complaint ID {complaint_id}")
    db = SessionLocal()
    
    try:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            logger.error(f"Complaint {complaint_id} not found in database.")
            return

        # Check if media status is ready and has an image URL
        if complaint.media_status != ComplaintMediaStatus.READY.value or not complaint.image_url:
            logger.warning(f"Complaint {complaint_id} media is not ready. Skipping AI routing task.")
            return

        # Skip if already processed or processing (unless it's a Celery retry)
        is_retry = self.request.retries > 0
        if complaint.ai_routing_status in ["SUCCESS", "PENDING_TRIAGE"] or (complaint.ai_routing_status == "PROCESSING" and not is_retry):
            logger.info(f"Complaint {complaint_id} AI routing is already in state {complaint.ai_routing_status}. Skipping.")
            return

        # Update status to processing
        complaint.ai_routing_status = "PROCESSING"
        db.commit()

        # Generate a short-lived presigned URL for secure access
        signed_image_url = ""
        if complaint.image_url:
            try:
                signed_image_url = generate_presigned_url(complaint.image_url)
                logger.info(f"Generated presigned URL for complaint {complaint_id}: {signed_image_url}")
            except Exception as s3_err:
                logger.error(f"Failed to generate presigned URL for complaint {complaint_id}: {s3_err}")
                signed_image_url = complaint.image_url

        # Build payload for AI service
        payload = {
            "complaint_id": complaint.id,
            "title": complaint.title,
            "description": complaint.description,
            "image_url": signed_image_url
        }
        headers = {
            "X-Internal-API-Key": settings.INTERNAL_API_KEY
        }
        ai_url = f"{settings.AI_SERVICE_URL}/v1/classify-complaint"

        logger.info(f"Calling AI service at {ai_url} for complaint {complaint_id}...")
        
        # Call AI service with a 30s timeout
        with httpx.Client(timeout=30.0) as client:
            response = client.post(ai_url, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            
        logger.info(f"AI Service response for complaint {complaint_id}: {result}")
        
        # Extract classification fields
        issue_type = result.get("issue_type")
        confidence_score = result.get("confidence_score", 0.0)
        reasoning = result.get("reasoning", "")
        image_agreement = result.get("image_text_agreement", "INCONCLUSIVE")

        # Map issue type to department
        mapped_dept = ISSUE_TO_DEPARTMENT_MAP.get(issue_type, "general")

        # Set default confidence threshold (0.80)
        CONFIDENCE_THRESHOLD = 0.80
        
        # Route logic
        if image_agreement == "SUPPORTIVE" and confidence_score >= CONFIDENCE_THRESHOLD:
            # High confidence auto-routing
            logger.info(f"Auto-routing complaint {complaint_id} to department '{mapped_dept}' (Confidence: {confidence_score})")
            complaint.department = mapped_dept
            complaint.status = "ASSIGNED"
            complaint.ai_routing_status = "SUCCESS"
        else:
            # Low confidence or contradictory agreement, route to general review (PENDING_TRIAGE)
            logger.info(f"Routing complaint {complaint_id} to manual review (Confidence: {confidence_score}, Agreement: {image_agreement})")
            complaint.department = "general"
            complaint.status = "PENDING"
            complaint.ai_routing_status = "PENDING_TRIAGE"

        # Populate AI audit metadata
        complaint.ai_issue_type = issue_type
        complaint.ai_confidence = confidence_score
        complaint.ai_reasoning = reasoning
        complaint.ai_image_agreement = image_agreement
        
        db.commit()
        logger.info(f"AI classification and routing completed successfully for complaint {complaint_id}")

    except Exception as exc:
        logger.error(f"Error classifying complaint {complaint_id}: {exc}", exc_info=True)
        db.rollback()
        
        try:
            logger.info(f"Retrying AI classification task for complaint {complaint_id} (retry {self.request.retries + 1}/{self.max_retries})")
            raise self.retry(exc=exc)
        except Exception as retry_exc:
            if isinstance(retry_exc, MaxRetriesExceededError):
                logger.error(f"Max retries exceeded for classifying complaint {complaint_id}. Falling back to manual review.")
                
                # Mark as failed and leave in general queue for manual triage
                db_fail = SessionLocal()
                try:
                    c = db_fail.query(Complaint).filter(Complaint.id == complaint_id).first()
                    if c:
                        c.ai_routing_status = "FAILED"
                        c.department = "general"
                        c.status = "PENDING"
                        db_fail.commit()
                finally:
                    db_fail.close()
                raise retry_exc
            raise retry_exc

    finally:
        db.close()
