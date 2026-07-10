from fastapi import APIRouter

router = APIRouter(prefix="/traffic", tags=["Traffic Management"])

@router.get("/")
def get_traffic():
    return {"message": "Traffic Management module active"}
