from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from dependencies.auth import get_current_user, UserData
from dependencies.db import get_db
from core.s3 import upload_file_to_s3
from .schema import PostResponse, RejectPostRequest
from .service import (
    create_post,
    get_post_by_id,
    get_visible_posts,
    get_my_posts,
    get_pending_posts,
    approve_post,
    reject_post,
    delete_post
)

router = APIRouter(prefix="/feed", tags=["Feed"])

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_new_post(
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    location: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_url = None
    if file:
        is_image = file.content_type.startswith("image/")
        if not is_image:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Limit image size to 10MB
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image size exceeds the limit of 10MB"
            )
        
        try:
            image_url = upload_file_to_s3(file.file, folder="feed", filename=file.filename)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"S3 Upload failed: {str(e)}"
            )

    # Determine author type and name
    if current_user.role in ["Department_Admin", "Super_Admin"]:
        author_type = "authority"
        permissions = current_user.permissions or []
        if "dept:water" in permissions:
            author_name = "Water Department"
        elif "dept:traffic" in permissions:
            author_name = "Traffic Department"
        elif "dept:waste" in permissions:
            author_name = "Waste Department"
        else:
            author_name = "City Administration"
    else:
        author_type = "citizen"
        author_name = current_user.username or "Citizen"

    return create_post(
        db=db,
        author_id=current_user.id,
        author_name=author_name,
        author_type=author_type,
        title=title,
        content=content,
        category=category,
        location=location,
        image_url=image_url
    )

@router.get("/posts", response_model=list[PostResponse])
def read_visible_posts(
    category: Optional[str] = None,
    feed_type: Optional[str] = None,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_visible_posts(db, category=category, feed_type=feed_type)

@router.get("/my-posts", response_model=list[PostResponse])
def read_my_posts(
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_my_posts(db, user_id=current_user.id)

@router.get("/pending", response_model=list[PostResponse])
def read_pending_posts(
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Department_Admin", "Super_Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only moderators can access the pending review list"
        )
    return get_pending_posts(db)

@router.patch("/posts/{post_id}/approve", response_model=PostResponse)
def approve_pending_post(
    post_id: int,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Department_Admin", "Super_Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only moderators can approve posts"
        )
    post = approve_post(db, post_id=post_id, reviewer_id=current_user.id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return post

@router.patch("/posts/{post_id}/reject", response_model=PostResponse)
def reject_pending_post(
    post_id: int,
    data: RejectPostRequest,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Department_Admin", "Super_Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only moderators can reject posts"
        )
    post = reject_post(db, post_id=post_id, reviewer_id=current_user.id, reason=data.reason)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return post

@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_post(
    post_id: int,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    is_creator = post.author_id == current_user.id
    is_moderator = current_user.role in ["Department_Admin", "Super_Admin"]
    if not is_creator and not is_moderator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this post"
        )
    
    delete_post(db, post_id=post_id)
    return
