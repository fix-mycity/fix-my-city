import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")

    SECRET_KEY = os.getenv("SECRET_KEY")

    ALGORITHM = os.getenv("ALGORITHM")

    ENV = os.getenv("ENV", "development")

    # AWS / S3 Configuration
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION = os.getenv("AWS_REGION")
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

    # Cashfree Secure ID
    CASHFREE_ENV = os.getenv("CASHFREE_ENV", "test")
    CASHFREE_BASE_URL = os.getenv("CASHFREE_BASE_URL", "https://sandbox.cashfree.com/verification")
    CASHFREE_CLIENT_ID = os.getenv("CASHFREE_CLIENT_ID")
    CASHFREE_CLIENT_SECRET = os.getenv("CASHFREE_CLIENT_SECRET")
    CASHFREE_API_VERSION = os.getenv("CASHFREE_API_VERSION", "2022-10-26")

    # Celery & RabbitMQ Configuration
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "amqp://guest:guest@localhost:5672//")


settings = Settings()

