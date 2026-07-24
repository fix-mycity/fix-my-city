from sqlalchemy.orm import Session
from datetime import datetime
from .model import Post, PostStatus

def create_post(
    db: Session,
    author_id: int,
    author_name: str,
    author_type: str,
    title: str,
    content: str,
    category: str,
    location: str = None,
    image_url: str = None
) -> Post:
    if author_type == "authority":
        status = PostStatus.APPROVED.value
        approved_by = author_id
        approved_at = datetime.utcnow()
    else:
        status = PostStatus.PENDING.value
        approved_by = None
        approved_at = None

    post = Post(
        author_id=author_id,
        author_type=author_type,
        author_name=author_name,
        title=title,
        content=content,
        category=category,
        location=location,
        image_url=image_url,
        status=status,
        approved_by=approved_by,
        approved_at=approved_at
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

def get_post_by_id(db: Session, post_id: int) -> Post | None:
    return db.query(Post).filter(Post.id == post_id).first()

def get_visible_posts(db: Session, category: str = None, feed_type: str = None) -> list[Post]:
    query = db.query(Post).filter(Post.status == PostStatus.APPROVED.value)
    if category and category.lower() != "all":
        query = query.filter(Post.category.ilike(category))
    if feed_type == "official":
        query = query.filter(Post.author_type == "authority")
    elif feed_type == "community":
        query = query.filter(Post.author_type == "citizen")
    
    return query.order_by(Post.created_at.desc()).all()

def get_my_posts(db: Session, user_id: int) -> list[Post]:
    return db.query(Post).filter(Post.author_id == user_id).order_by(Post.created_at.desc()).all()

def get_pending_posts(db: Session) -> list[Post]:
    return db.query(Post).filter(Post.status == PostStatus.PENDING.value).order_by(Post.created_at.desc()).all()

def approve_post(db: Session, post_id: int, reviewer_id: int) -> Post | None:
    post = get_post_by_id(db, post_id)
    if not post:
        return None
    post.status = PostStatus.APPROVED.value
    post.approved_by = reviewer_id
    post.approved_at = datetime.utcnow()
    post.rejection_reason = None
    db.commit()
    db.refresh(post)
    return post

def reject_post(db: Session, post_id: int, reviewer_id: int, reason: str) -> Post | None:
    post = get_post_by_id(db, post_id)
    if not post:
        return None
    post.status = PostStatus.REJECTED.value
    post.approved_by = reviewer_id
    post.approved_at = datetime.utcnow()
    post.rejection_reason = reason
    db.commit()
    db.refresh(post)
    return post

def delete_post(db: Session, post_id: int) -> bool:
    post = get_post_by_id(db, post_id)
    if not post:
        return False
    db.delete(post)
    db.commit()
    return True
