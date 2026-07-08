from fastapi import APIRouter

router = APIRouter(prefix="/waste", tags=["Waste Management"])

@router.get("/")
def get_waste_mgmt():
    return {"message": "Waste Management module active"}
