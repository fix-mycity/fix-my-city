import io
import logging
from PIL import Image

logger = logging.getLogger(__name__)

def preprocess_image_bytes(image_bytes: bytes) -> bytes:
    """
    Preprocess an image from raw bytes:
    1. Read using Pillow
    2. Convert to RGB (to drop alpha channel and support JPEG conversion)
    3. Resize longest edge to max 1024px while keeping aspect ratio
    4. Compress as JPEG with quality=85
    5. Strips EXIF metadata automatically since we construct a new image and don't pass EXIF during save
    """
    try:
        # Load image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Keep track of original size
        orig_w, orig_h = img.size
        logger.info(f"Original image dimensions: {orig_w}x{orig_h}")
        
        # Convert to RGB if needed (JPEG doesn't support RGBA)
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        # Check resizing requirements
        max_size = 1024
        if orig_w > max_size or orig_h > max_size:
            if orig_w > orig_h:
                new_w = max_size
                new_h = int((orig_h / orig_w) * max_size)
            else:
                new_h = max_size
                new_w = int((orig_w / orig_h) * max_size)
            
            # Resize image with LANCZOS resampling (equivalent to high quality scaling)
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            logger.info(f"Resized image to: {new_w}x{new_h}")
            
        # Save to buffer as JPEG with compression
        out_buf = io.BytesIO()
        # EXIF is stripped automatically by not passing any 'exif' parameter in save()
        img.save(out_buf, format="JPEG", quality=85)
        
        preprocessed_bytes = out_buf.getvalue()
        logger.info(f"Image preprocessed. Size reduced from {len(image_bytes)} to {len(preprocessed_bytes)} bytes.")
        
        return preprocessed_bytes
    except Exception as e:
        logger.error(f"Failed to preprocess image: {str(e)}", exc_info=True)
        # If preprocessing fails, return original bytes as a fallback
        return image_bytes
