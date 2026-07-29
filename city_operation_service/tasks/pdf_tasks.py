import os
import io
import urllib.request
from celery import shared_task
from database import SessionLocal
from config import settings
from core.s3 import upload_file_to_s3, generate_presigned_url

@shared_task(name="tasks.generate_complaint_pdf_report")
def generate_complaint_pdf_report(task_id: int):
    """
    Background Celery Task:
    Generates a formal PDF Work Completion Report for a resolved task,
    embeds metadata and Before/After photos, uploads to S3, and returns the URL.
    """
    db = SessionLocal()
    try:
        from modules.complaints.model import Complaint
        from modules.workers.model import WorkerProfile
        from sqlalchemy import text

        task = db.query(Complaint).filter(Complaint.id == task_id).first()
        if not task:
            return {"success": False, "message": "Complaint task not found"}

        # Fetch worker info if assigned
        worker_name = "Assigned Field Worker"
        if task.assigned_worker_id:
            row = db.execute(
                text("SELECT u.username, p.first_name, p.last_name FROM users u LEFT JOIN worker_profiles p ON u.id = p.user_id WHERE u.id = :wid"),
                {"wid": task.assigned_worker_id}
            ).fetchone()
            if row:
                fn = row[1] or ""
                ln = row[2] or ""
                full = f"{fn} {ln}".strip()
                worker_name = full if full else (row[0] or f"Worker #{task.assigned_worker_id}")

        # PDF Compilation using ReportLab
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
            styles = getSampleStyleSheet()
            story = []

            # Custom Palette
            primary_color = colors.HexColor("#1A365D")
            secondary_color = colors.HexColor("#2563EB")
            accent_color = colors.HexColor("#059669")
            text_color = colors.HexColor("#1E293B")

            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontSize=20,
                leading=24,
                textColor=primary_color,
                fontName='Helvetica-Bold'
            )

            subtitle_style = ParagraphStyle(
                'DocSubtitle',
                parent=styles['Normal'],
                fontSize=10,
                leading=14,
                textColor=colors.HexColor("#64748B"),
                fontName='Helvetica'
            )

            heading_style = ParagraphStyle(
                'SectionHeading',
                parent=styles['Heading2'],
                fontSize=12,
                leading=16,
                textColor=primary_color,
                fontName='Helvetica-Bold',
                spaceBefore=10,
                spaceAfter=6
            )

            body_style = ParagraphStyle(
                'BodyTextCustom',
                parent=styles['Normal'],
                fontSize=9,
                leading=13,
                textColor=text_color,
                fontName='Helvetica'
            )

            # Header Banner
            story.append(Paragraph("FIX MY CITY — MUNICIPAL FIELD OPERATIONS", subtitle_style))
            story.append(Spacer(1, 4))
            story.append(Paragraph(f"Work Completion & Incident Report #{task.id}", title_style))
            story.append(Spacer(1, 8))
            story.append(HRFlowable(width="100%", thickness=2, color=secondary_color, spaceAfter=12))

            # Format Location Address
            loc_lat = getattr(task, "location_lat", None) or getattr(task, "latitude", None)
            loc_lng = getattr(task, "location_lng", None) or getattr(task, "longitude", None)
            loc_address = getattr(task, "address", None) or getattr(task, "area", None) or getattr(task, "place", None)

            location_str = "Location N/A"
            if loc_lat and loc_lng:
                try:
                    import json
                    req_geo = urllib.request.Request(
                        f"https://nominatim.openstreetmap.org/reverse?format=json&lat={loc_lat}&lon={loc_lng}",
                        headers={'User-Agent': 'FixMyCity-App/1.0', 'Accept-Language': 'en'}
                    )
                    with urllib.request.urlopen(req_geo, timeout=3) as geo_resp:
                        geo_data = json.loads(geo_resp.read().decode())
                        geo_name = geo_data.get("display_name", "")
                        if geo_name:
                            parts = [p.strip() for p in geo_name.split(",")]
                            short_geo = ", ".join(parts[:3])
                            location_str = f"{short_geo} ({loc_lat:.4f}, {loc_lng:.4f})"
                        else:
                            location_str = f"GPS: {loc_lat:.4f}, {loc_lng:.4f}"
                except Exception:
                    if loc_address and loc_address != "N/A":
                        location_str = f"{loc_address} (GPS: {loc_lat:.4f}, {loc_lng:.4f})"
                    else:
                        location_str = f"GPS: {loc_lat:.4f}, {loc_lng:.4f}"

            # Format Timestamps
            created_at = getattr(task, "created_at", None)
            resolved_at = getattr(task, "resolved_at", None) or getattr(task, "updated_at", None)
            created_str = created_at.strftime("%Y-%m-%d %H:%M") if created_at and hasattr(created_at, "strftime") else (str(created_at) if created_at else "N/A")
            resolved_str = resolved_at.strftime("%Y-%m-%d %H:%M") if resolved_at and hasattr(resolved_at, "strftime") else (str(resolved_at) if resolved_at else "N/A")

            meta_data = [
                [Paragraph("<b>Incident Title:</b>", body_style), Paragraph(task.title or "N/A", body_style), Paragraph("<b>Department:</b>", body_style), Paragraph((task.department or "General").upper(), body_style)],
                [Paragraph("<b>Status:</b>", body_style), Paragraph(f"<font color='green'><b>{task.status}</b></font>", body_style), Paragraph("<b>Field Officer:</b>", body_style), Paragraph(worker_name, body_style)],
                [Paragraph("<b>Date Reported:</b>", body_style), Paragraph(created_str, body_style), Paragraph("<b>Date Resolved:</b>", body_style), Paragraph(resolved_str, body_style)],
                [Paragraph("<b>Location:</b>", body_style), Paragraph(location_str, body_style), Paragraph("<b>Case Ref:</b>", body_style), Paragraph(f"FMC-COMP-{task.id}", body_style)]
            ]

            meta_table = Table(meta_data, colWidths=[90, 180, 90, 180])
            meta_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            story.append(meta_table)
            story.append(Spacer(1, 14))

            # Problem Description & Work Summary Section
            story.append(Paragraph("Incident Description & Resolution Notes", heading_style))
            desc_text = f"<b>Citizen Complaint Summary:</b> {task.description or 'No description provided.'}<br/><br/><b>Field Officer Resolution Notes:</b> {task.resolution_report or 'Resolution completed on site.'}"
            story.append(Paragraph(desc_text, body_style))
            story.append(Spacer(1, 14))

            # Before & After Photos Section
            story.append(Paragraph("Visual Evidence: Before vs. After Fix", heading_style))

            img_elements = []

            # Before image flowable
            before_url = generate_presigned_url(task.image_url) if task.image_url else None
            after_url = generate_presigned_url(task.resolution_image) if task.resolution_image else None

            def fetch_image_flowable(img_url, label):
                if not img_url:
                    return Paragraph(f"<font color='#94A3B8'>No {label} photo</font>", body_style)
                try:
                    req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=5) as resp:
                        img_data = resp.read()
                        img_buffer = io.BytesIO(img_data)
                        return Image(img_buffer, width=240, height=160)
                except Exception as e:
                    return Paragraph(f"<font color='#94A3B8'>{label} photo unavailable</font>", body_style)

            before_flow = fetch_image_flowable(before_url, "Before Fix")
            after_flow = fetch_image_flowable(after_url, "After Fix")

            img_table_data = [
                [Paragraph("<b>Before Fix (Citizen Photo)</b>", body_style), Paragraph("<b>After Fix (Officer Proof)</b>", body_style)],
                [before_flow, after_flow]
            ]

            img_table = Table(img_table_data, colWidths=[270, 270])
            img_table.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ]))
            story.append(img_table)
            story.append(Spacer(1, 16))

            # Footer / Clearance Sign-off
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=8))
            story.append(Paragraph("This is an officially generated Fix My City Municipal Incident Completion Document.", subtitle_style))

            doc.build(story)
            pdf_bytes = buffer.getvalue()
            buffer.close()

            # Upload PDF to S3
            pdf_buffer = io.BytesIO(pdf_bytes)
            s3_url = upload_file_to_s3(pdf_buffer, folder="pdf-reports", filename=f"Work_Report_Task_{task.id}.pdf")
            presigned_pdf_url = generate_presigned_url(s3_url)

            return {
                "success": True,
                "task_id": task.id,
                "pdf_url": presigned_pdf_url,
                "message": "PDF Report generated successfully"
            }

        except Exception as pdf_err:
            print(f"PDF rendering error: {pdf_err}")
            return {"success": False, "message": f"PDF Generation Error: {str(pdf_err)}"}

    finally:
        db.close()
