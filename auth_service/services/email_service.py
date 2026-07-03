import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings


def send_otp_email(email: str, otp: str) -> bool:
    # Fallback to local console log if SMTP credentials are not configured
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"[SMTP SIMULATOR] To: {email} | Body: Your OTP is {otp}")
        return True

    try:
        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_SENDER
        msg["To"] = email
        msg["Subject"] = "Fix My City - Security OTP"

        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1e3a8a;">Welcome to Fix My City</h2>
            <p>You requested a verification code. Please use the following One-Time Password (OTP) to proceed:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a; border-radius: 5px; margin: 20px 0;">
                {otp}
            </div>
            <p>This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
            <br>
            <p>Regards,<br>Fix My City Team</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_SENDER, email, msg.as_string())

        print(f"OTP email sent successfully to {email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {email} via Brevo SMTP: {e}")
        # Always output to console in case of connection errors during testing
        print(f"[SMTP FALLBACK] OTP for {email} is {otp}")
        return False