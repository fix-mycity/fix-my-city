import os
from celery import Celery
from config import settings

# Initialize the unified Celery application with RabbitMQ
celery_app = Celery(
    "fix_my_city",
    broker=settings.CELERY_BROKER_URL,
    include=["tasks.pdf_tasks"]
)

# Apply common Celery configurations
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Autodiscover tasks in modules.complaints and tasks
celery_app.autodiscover_tasks(["modules.complaints", "tasks"])
