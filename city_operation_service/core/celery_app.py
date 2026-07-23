import os
from celery import Celery
from config import settings

# Initialize the Celery application
# Use settings.CELERY_BROKER_URL as the message broker (RabbitMQ)
celery_app = Celery(
    "fix_my_city",
    broker=settings.CELERY_BROKER_URL
)

# Apply common celery configurations
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Autodiscover tasks in modules.complaints
celery_app.autodiscover_tasks(["modules.complaints"])
