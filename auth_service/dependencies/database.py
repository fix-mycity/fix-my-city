from database import SessionLocal  # type: ignore


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()