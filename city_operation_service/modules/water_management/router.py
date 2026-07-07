from fastapi import APIRouter

router = APIRouter(prefix="/water", tags=["Water Management"])

@router.get("/")
def get_water():
    return {"message": "Water Management module active"}
