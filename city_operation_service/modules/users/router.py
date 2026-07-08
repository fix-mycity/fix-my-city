from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["Users Dashboard"])

@router.get("/")
def get_users():
    return {"message": "Users module active"}
