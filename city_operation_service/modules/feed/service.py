from sqlalchemy.orm import Session
from datetime import datetime
from .model import Post, PostStatus, PostComment, PostReaction, Suggestion
from .schema import SuggestionCreate

def enrich_post(db: Session, post: Post, current_user_id: int = None) -> Post:
    if not post:
        return post
    reactions_count = db.query(PostReaction).filter(PostReaction.post_id == post.id).count()
    has_reacted = False
    if current_user_id:
        has_reacted = db.query(PostReaction).filter(
            PostReaction.post_id == post.id,
            PostReaction.user_id == current_user_id
        ).first() is not None
    
    post.reactions_count = reactions_count
    post.has_reacted = has_reacted
    return post

def enrich_posts(db: Session, posts: list[Post], current_user_id: int = None) -> list[Post]:
    return [enrich_post(db, post, current_user_id) for post in posts]

def create_post(
    db: Session,
    author_id: int,
    author_name: str,
    author_type: str,
    title: str,
    content: str,
    category: str,
    location: str = None,
    image_url: str = None,
    current_user_id: int = None
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
    return enrich_post(db, post, current_user_id)

def get_post_by_id(db: Session, post_id: int, current_user_id: int = None) -> Post | None:
    post = db.query(Post).filter(Post.id == post_id).first()
    return enrich_post(db, post, current_user_id)

def get_visible_posts(db: Session, category: str = None, feed_type: str = None, current_user_id: int = None) -> list[Post]:
    query = db.query(Post).filter(Post.status == PostStatus.APPROVED.value)
    if category and category.lower() != "all":
        cat_lower = category.lower()
        if cat_lower == "waste":
            query = query.filter(
                (Post.category.ilike("waste")) | 
                ((Post.category.ilike("announcement")) & (Post.author_name.ilike("%waste%")))
            )
        elif cat_lower == "water":
            query = query.filter(
                (Post.category.ilike("water")) | 
                ((Post.category.ilike("announcement")) & (Post.author_name.ilike("%water%")))
            )
        elif cat_lower == "traffic":
            query = query.filter(
                (Post.category.ilike("traffic")) | 
                ((Post.category.ilike("announcement")) & (Post.author_name.ilike("%traffic%")))
            )
        elif cat_lower == "general":
            query = query.filter(
                (Post.category.ilike("general")) | 
                ((Post.category.ilike("announcement")) & (Post.author_name.ilike("%general%")))
            )
        else:
            query = query.filter(Post.category.ilike(category))
    if feed_type == "official":
        query = query.filter(Post.author_type == "authority")
    elif feed_type == "community":
        query = query.filter(Post.author_type == "citizen")
    
    posts = query.order_by(Post.created_at.desc()).all()
    return enrich_posts(db, posts, current_user_id)

def get_my_posts(db: Session, user_id: int, current_user_id: int = None) -> list[Post]:
    posts = db.query(Post).filter(Post.author_id == user_id).order_by(Post.created_at.desc()).all()
    return enrich_posts(db, posts, current_user_id)

def get_pending_posts(db: Session, current_user_id: int = None) -> list[Post]:
    posts = db.query(Post).filter(Post.status == PostStatus.PENDING.value).order_by(Post.created_at.desc()).all()
    return enrich_posts(db, posts, current_user_id)

def approve_post(db: Session, post_id: int, reviewer_id: int, current_user_id: int = None) -> Post | None:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    post.status = PostStatus.APPROVED.value
    post.approved_by = reviewer_id
    post.approved_at = datetime.utcnow()
    post.rejection_reason = None
    db.commit()
    db.refresh(post)
    return enrich_post(db, post, current_user_id)

def reject_post(db: Session, post_id: int, reviewer_id: int, reason: str, current_user_id: int = None) -> Post | None:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    post.status = PostStatus.REJECTED.value
    post.approved_by = reviewer_id
    post.approved_at = datetime.utcnow()
    post.rejection_reason = reason
    db.commit()
    db.refresh(post)
    return enrich_post(db, post, current_user_id)

def delete_post(db: Session, post_id: int) -> bool:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return False
    # Also delete comments and reactions when post is deleted
    db.query(PostComment).filter(PostComment.post_id == post_id).delete()
    db.query(PostReaction).filter(PostReaction.post_id == post_id).delete()
    db.delete(post)
    db.commit()
    return True

# Comments Logic
def create_comment(db: Session, post_id: int, author_id: int, author_name: str, author_role: str, content: str) -> PostComment:
    comment = PostComment(
        post_id=post_id,
        author_id=author_id,
        author_name=author_name,
        author_role=author_role,
        content=content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def get_comments_by_post(db: Session, post_id: int) -> list[PostComment]:
    return db.query(PostComment).filter(PostComment.post_id == post_id).order_by(PostComment.created_at.asc()).all()

def delete_comment(db: Session, comment_id: int, user_id: int, user_role: str) -> bool:
    comment = db.query(PostComment).filter(PostComment.id == comment_id).first()
    if not comment:
        return False
    # Check permissions (only author or authority/moderator can delete)
    if comment.author_id != user_id and user_role not in ["Department_Admin", "Super_Admin", "Admin"]:
        return False
    db.delete(comment)
    db.commit()
    return True

# Reactions Logic
def toggle_post_reaction(db: Session, post_id: int, user_id: int, reaction_type: str = "LIKE") -> dict:
    reaction = db.query(PostReaction).filter(
        PostReaction.post_id == post_id,
        PostReaction.user_id == user_id
    ).first()
    
    if reaction:
        db.delete(reaction)
        db.commit()
        action = "removed"
    else:
        new_reaction = PostReaction(
            post_id=post_id,
            user_id=user_id,
            reaction_type=reaction_type
        )
        db.add(new_reaction)
        db.commit()
        action = "added"
        
    count = db.query(PostReaction).filter(PostReaction.post_id == post_id).count()
    return {"action": action, "reactions_count": count, "has_reacted": action == "added"}

# Suggestions CRUD
def create_suggestion(db: Session, citizen_id: int, data: SuggestionCreate) -> Suggestion:
    from modules.users.model import Profile
    profile = db.query(Profile).filter(Profile.user_id == citizen_id).first()
    citizen_name = (profile.full_name or "").strip() if profile else ""
    if not citizen_name:
        citizen_name = "Citizen"

    suggestion = Suggestion(
        citizen_id=citizen_id,
        citizen_name=citizen_name,
        title=data.title,
        description=data.description,
        category=data.category
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion


def get_suggestions_by_citizen(db: Session, citizen_id: int) -> list[Suggestion]:
    return db.query(Suggestion).filter(Suggestion.citizen_id == citizen_id).order_by(Suggestion.created_at.desc()).all()

def get_all_suggestions(db: Session) -> list[Suggestion]:
    return db.query(Suggestion).order_by(Suggestion.created_at.desc()).all()
