import boto3
from botocore.exceptions import ClientError
import uuid
import os
from config import settings

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

def upload_file_to_s3(file_obj, folder: str, filename: str) -> str:
    """
    Uploads a file-like object to S3 under the specified folder with a unique name.
    Returns the public URL of the uploaded file.
    """
    ext = os.path.splitext(filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    key = f"{folder}/{unique_filename}"
    
    # Simple mime-type resolution
    content_type = get_content_type(ext)
    
    s3_client.upload_fileobj(
        file_obj,
        settings.S3_BUCKET_NAME,
        key,
        ExtraArgs={
            "ContentType": content_type
        }
    )
        
    return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"

def get_content_type(ext: str) -> str:
    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp"
    }
    return mime_types.get(ext.lower(), "application/octet-stream")

def clean_s3_url(s3_url: str) -> str:
    """
    Strips query string parameters (such as presigned signature parameters)
    from an S3 URL to return the raw, clean base S3 URL.
    """
    if not s3_url:
        return s3_url
    return s3_url.split("?")[0]

def generate_presigned_url(s3_url: str) -> str:
    """
    Generates a pre-signed URL given a full S3 URL of the format:
    https://<bucket>.s3.<region>.amazonaws.com/<key>
    or
    https://<bucket>.s3.amazonaws.com/<key>
    """
    if not s3_url:
        return s3_url
    
    clean_url = clean_s3_url(s3_url)
    
    # Check if this is an S3 URL pointing to our bucket
    prefix = f"https://{settings.S3_BUCKET_NAME}.s3"
    if not clean_url.startswith(prefix):
        alt_prefix = f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com"
        if not clean_url.startswith(alt_prefix):
            return s3_url
            
    try:
        parts = clean_url.split(".amazonaws.com/")
        if len(parts) < 2:
            return s3_url
        key = parts[1]
        
        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.S3_BUCKET_NAME,
                "Key": key
            },
            ExpiresIn=3600
        )
        return presigned_url
    except Exception:
        return s3_url
