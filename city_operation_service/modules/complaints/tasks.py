import os
import logging
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from database import SessionLocal
from modules.complaints.model import Complaint, ComplaintMediaStatus
from core.s3 import upload_file_to_s3

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
