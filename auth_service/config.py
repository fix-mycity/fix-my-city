import os
from dotenv import load_dotenv

load_dotenv()


class Settings:

    DATABASE_URL = os.getenv("DATABASE_URL")

    SECRET_KEY = os.getenv("SECRET_KEY")

    ALGORITHM = os.getenv("ALGORITHM")

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
    )

    REFRESH_TOKEN_EXPIRE_DAYS = int(
        os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7)
    )

    SMTP_HOST = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")

    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

    SMTP_USERNAME = os.getenv("SMTP_USERNAME")

    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

    SMTP_SENDER = os.getenv("SMTP_SENDER", "fixmycity11@gmail.com")


settings = Settings()