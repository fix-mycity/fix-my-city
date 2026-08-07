import io
from PIL import Image
from app.core.image import preprocess_image_bytes

def test_preprocess_image_bytes_resizing():
    # 1. Create a large dummy PNG image (1200 x 800) in memory
    img = Image.new("RGB", (1200, 800), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    original_bytes = buf.getvalue()

    # 2. Run preprocessing
    processed_bytes = preprocess_image_bytes(original_bytes)

    # 3. Assert resized dimensions (max edge is 1024, preserving 3:2 ratio => 1024x682)
    processed_img = Image.open(io.BytesIO(processed_bytes))
    assert processed_img.format == "JPEG"
    assert processed_img.size == (1024, 682)

def test_preprocess_image_bytes_small():
    # 1. Create a small dummy PNG image (500 x 300)
    img = Image.new("RGB", (500, 300), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    original_bytes = buf.getvalue()

    # 2. Run preprocessing
    processed_bytes = preprocess_image_bytes(original_bytes)

    # 3. Assert dimensions are preserved but format is converted to JPEG
    processed_img = Image.open(io.BytesIO(processed_bytes))
    assert processed_img.format == "JPEG"
    assert processed_img.size == (500, 300)
