from celery import Celery
from config import settings

celery_app = Celery(
    "city_operations",
    broker=getattr(settings, "CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=getattr(settings, "CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    include=["tasks.pdf_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
