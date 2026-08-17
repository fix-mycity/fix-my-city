import httpx
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import verify_internal_api_key
from app.core.image import preprocess_image_bytes
from app.core.gemini import analyze_complaint
from app.schemas.classification import ClassificationRequest, ClassificationResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["Classification"])

@router.post(
    "/classify-complaint",
    response_model=ClassificationResponse,
    dependencies=[Depends(verify_internal_api_key)]
)
async def classify_complaint_endpoint(request: ClassificationRequest):
    """
    HTTP POST endpoint to fetch the image from URL, preprocess it,
    send it alongside text metadata to the Gemini API, and return structured routing suggestions.
    """
    logger.info(f"Received classification request for complaint ID: {request.complaint_id}")
    
    # 1. Fetch image from URL
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            logger.info(f"Fetching image from S3/Storage: {request.image_url}")
            response = await client.get(request.image_url)
            response.raise_for_status()
            image_bytes = response.content
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching image from {request.image_url}: {e.response.status_code}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to retrieve media file from URL. HTTP Status: {e.response.status_code}"
            )
        except Exception as e:
            logger.error(f"Unexpected error fetching image: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not load image from image_url: {str(e)}"
            )

    # 2. Preprocess image
    logger.info("Starting image preprocessing step...")
    preprocessed_bytes = preprocess_image_bytes(image_bytes)

    # 3. Analyze complaint using Gemini API
    try:
        logger.info("Submitting preprocessed visual content and metadata to Gemini analyzer...")
        analysis_result = await analyze_complaint(
            title=request.title,
            description=request.description,
            image_bytes=preprocessed_bytes
        )
    except Exception as e:
        logger.error(f"AI Service processing error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini AI processing failed: {str(e)}"
        )

    # 4. Return response
    logger.info(f"Successfully processed classification for complaint {request.complaint_id}. Result: {analysis_result.issue_type}")
    return ClassificationResponse(
        complaint_id=request.complaint_id,
        issue_type=analysis_result.issue_type,
        confidence_score=analysis_result.confidence_score,
        reasoning=analysis_result.reasoning,
        primary_focal_point=analysis_result.primary_focal_point,
        image_text_agreement=analysis_result.image_text_agreement
    )
