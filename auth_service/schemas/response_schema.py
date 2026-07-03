from pydantic import BaseModel
from typing import Optional, Any


class ResponseSchema(BaseModel):

    success: bool

    message: str

    data: Optional[Any] = None