from pydantic import BaseModel, Field
from typing import Literal

class ClassificationRequest(BaseModel):
    complaint_id: int = Field(..., description="ID of the complaint being analyzed.")
    title: str = Field(..., description="Title of the complaint.")
    description: str = Field(..., description="Detailed description of the complaint.")
    image_url: str = Field(..., description="URL of the uploaded image/media.")

class ClassificationResponse(BaseModel):
    complaint_id: int = Field(..., description="ID of the complaint analyzed.")
    issue_type: Literal[
        "pothole",
        "broken_traffic_signal",
        "illegal_parking",
        "garbage_accumulation",
        "sewage_overflow",
        "water_leak",
        "broken_hydrant",
        "street_light_issue",
        "accident",
        "other"
    ] = Field(..., description="Classified issue type representing the civic problem.")
    confidence_score: float = Field(..., description="Confidence rating between 0.0 and 1.0.")
    reasoning: str = Field(..., description="Explanation of why the category was selected.")
    primary_focal_point: str = Field(..., description="Main visual element illustrating the problem.")
    image_text_agreement: Literal["SUPPORTIVE", "CONTRADICTORY", "INCONCLUSIVE"] = Field(
        ..., description="Agreement evaluation between the text description and visual content."
    )
