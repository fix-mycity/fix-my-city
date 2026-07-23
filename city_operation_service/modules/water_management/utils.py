from fastapi import Request, HTTPException, status
from jose import jwt, JWTError
from config import settings

class UserData:
    def __init__(self, id: int, username: str | None, email: str | None, role: str | None):
        self.id = id
        self.username = username
        self.email = email
        self.role = role

def get_current_water_user(request: Request) -> UserData:
    token = None
    
    # 1. Try reading from Authorization Header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        
    # 2. Fallback to access_token Cookie (useful for web integrations)
    if not token:
        token = request.cookies.get("access_token")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in first."
        )
        
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed: missing user reference."
            )
        return UserData(
            id=int(user_id_str),
            username=payload.get("username"),
            email=payload.get("email"),
            role=payload.get("role")
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired. Please re-authenticate."
        )

import hashlib
import os
import base64

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    db_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    encoded_salt = base64.b64encode(salt).decode('utf-8')
    encoded_hash = base64.b64encode(db_hash).decode('utf-8')
    return f"pbkdf2_sha256$100000${encoded_salt}${encoded_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        parts = hashed_password.split('$')
        if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
            return False
        iterations = int(parts[1])
        salt = base64.b64decode(parts[2])
        stored_hash = base64.b64decode(parts[3])
        new_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, iterations)
        return new_hash == stored_hash
    except Exception:
        return False


# Report Generation Exporters
import csv
import io

def generate_csv_report(headers: list, rows: list) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    for r in rows:
        writer.writerow(r)
    return output.getvalue()

def generate_excel_report(title: str, headers: list, rows: list) -> str:
    # Generates a beautifully styled HTML table which Excel opens natively with gridlines, fonts, and borders.
    html = f"""<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{title[:30]}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; }}
  table {{ border-collapse: collapse; width: 100%; }}
  th {{ background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left; }}
  td {{ border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }}
  tr:nth-child(even) {{ background-color: #f8fafc; }}
  .title-header {{ font-size: 18px; font-weight: bold; color: #1e293b; padding: 12px 0; }}
</style>
</head>
<body>
  <div class="title-header">{title}</div>
  <table>
    <thead>
      <tr>
        {"".join(f"<th>{h}</th>" for h in headers)}
      </tr>
    </thead>
    <tbody>
      {"".join("<tr>" + "".join(f"<td>{str(val)}</td>" for val in row) + "</tr>" for row in rows)}
    </tbody>
  </table>
</body>
</html>"""
    return html

def generate_pdf_report(title: str, headers: list, rows: list) -> bytes:
    # First-principles PDF-1.4 file byte structure compiler.
    # Page size: A4 (595.27 x 841.89 points)
    # Margin: 40 points. Printable width: 515.27 points.
    
    col_count = len(headers)
    col_width = 515.27 / max(col_count, 1)
    
    pages = []
    current_rows = []
    rows_per_page = 38
    for i, r in enumerate(rows):
        current_rows.append(r)
        if len(current_rows) == rows_per_page or i == len(rows) - 1:
            pages.append(current_rows)
            current_rows = []
            
    if not pages:
        pages = [[]]

    # PDF object offsets list (1-indexed mapping)
    objects = []
    
    def add_object(data: bytes) -> int:
        obj_num = len(objects) + 1
        objects.append((obj_num, data))
        return obj_num
        
    # Standard fonts objects
    # Obj 3: F1 (Helvetica)
    # Obj 4: F2 (Helvetica-Bold)
    f1_num = 3
    f2_num = 4
    
    # We will write catalog and pages root later to calculate cross-references,
    # but we can pre-allocate their object numbers: Catalog = 1, PagesRoot = 2
    catalog_num = 1
    pages_root_num = 2
    
    # Prepare Page and Content stream mappings
    page_nums = []
    stream_nums = []
    
    next_obj = 5
    for i in range(len(pages)):
        page_nums.append(next_obj)
        stream_nums.append(next_obj + 1)
        next_obj += 2
        
    # Write Font objects
    font_f1 = f"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    font_f2 = f"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
    
    # Let's populate the objects list.
    # Note: Catalog and PagesRoot will be updated at the end.
    objects.append((1, b"")) # Catalog placeholder
    objects.append((2, b"")) # PagesRoot placeholder
    objects.append((3, f"{f1_num} 0 obj\n{font_f1}\nendobj".encode("utf-8")))
    objects.append((4, f"{f2_num} 0 obj\n{font_f2}\nendobj".encode("utf-8")))
    
    # Write page and content stream definitions
    for idx, page_rows in enumerate(pages):
        page_num = page_nums[idx]
        stream_num = stream_nums[idx]
        
        # Page object linking content stream
        page_obj = f"{page_num} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /MediaBox [ 0 0 595.27 841.89 ] /Contents {stream_num} 0 R >>\nendobj".encode("utf-8")
        objects.append((page_num, page_obj))
        
        # Build contents byte stream
        stream = []
        # Title header (Page 1 only)
        if idx == 0:
            stream.append(f"BT\n/F2 16 Tf\n40 800 Td\n({title}) Tj\nET".encode("utf-8"))
        else:
            stream.append(f"BT\n/F2 12 Tf\n40 800 Td\n({title} - Page {idx+1}) Tj\nET".encode("utf-8"))
            
        # Draw table headers
        stream.append(b"BT\n/F2 9 Tf\n")
        y = 760
        for col_idx, h in enumerate(headers):
            x = 40 + (col_idx * col_width)
            # escape parentheses
            h_safe = str(h).replace("(", "\\(").replace(")", "\\)")
            stream.append(f"{x} {y} Td\n({h_safe}) Tj\n{-x} 0 Td\n".encode("utf-8"))
        stream.append(b"ET\n")
        
        # Draw horizontal border line under headers
        stream.append(f"0.5 w\n40 {y-4} m\n555.27 {y-4} l\nS\n".encode("utf-8"))
        
        # Draw rows
        y -= 20
        stream.append(b"BT\n/F1 8 Tf\n")
        for r in page_rows:
            for col_idx, val in enumerate(r):
                x = 40 + (col_idx * col_width)
                val_safe = str(val).replace("(", "\\(").replace(")", "\\)")
                stream.append(f"{x} {y} Td\n({val_safe}) Tj\n{-x} 0 Td\n".encode("utf-8"))
            y -= 18
        stream.append(b"ET\n")
        
        # Finalize Content stream object
        content_bytes = b"\n".join(stream)
        stream_obj = f"{stream_num} 0 obj\n<< /Length {len(content_bytes)} >>\nstream\n".encode("utf-8") + content_bytes + b"\nendstream\nendobj"
        objects.append((stream_num, stream_obj))
        
    # Write catalog and pages root definitions
    kids_str = " ".join(f"{num} 0 R" for num in page_nums)
    pages_root = f"2 0 obj\n<< /Type /Pages /Count {len(pages)} /Kids [ {kids_str} ] >>\nendobj".encode("utf-8")
    catalog = f"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj".encode("utf-8")
    
    # Overwrite placeholders
    objects[0] = (1, catalog)
    objects[1] = (2, pages_root)
    
    # Now compile PDF binary file offset trail
    pdf_stream = io.BytesIO()
    pdf_stream.write(b"%PDF-1.4\n")
    
    offsets = {}
    # Sort by object number to write sequentially
    objects.sort(key=lambda x: x[0])
    for obj_num, obj_bytes in objects:
        offsets[obj_num] = pdf_stream.tell()
        pdf_stream.write(obj_bytes)
        pdf_stream.write(b"\n")
        
    # Write xref table
    xref_pos = pdf_stream.tell()
    pdf_stream.write(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f\n".encode("utf-8"))
    for obj_num in range(1, len(objects) + 1):
        offset = offsets[obj_num]
        pdf_stream.write(f"{offset:010d} 00000 n\n".encode("utf-8"))
        
    # Write trailer
    pdf_stream.write(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode("utf-8"))
    return pdf_stream.getvalue()


