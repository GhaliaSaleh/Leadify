import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .config import settings

def send_asset_email(to_email: str, asset_name: str, asset_path: str):
    # The email sender and password from our settings
    sender_email = settings.SMTP_EMAIL
    sender_password = settings.SMTP_PASSWORD

    # Create the multipart message
    message = MIMEMultipart("alternative")
    message["Subject"] = f"هديتك المجانية: {asset_name}"
    message["From"] = sender_email
    message["To"] = to_email

  
    base_url = "https://leadify-fkt3.onrender.com"
    
    # نقوم بتركيب الرابط الكامل
    download_link = f"{base_url}/{asset_path}"

    # Create the HTML part of the message
    html = f"""
    <html>
    <body dir="rtl" style="font-family: sans-serif;">
        <p>مرحباً,</p>
        <p>شكرًا لاهتمامك! يمكنك تحميل كتابك <strong>"{asset_name}"</strong> من الرابط التالي:</p>
        <p style="text-align: center;">
            <a href="{download_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">اضغط هنا للتحميل</a>
        </p>
        <p>شكرًا لك،<br>فريق Leadify</p>
    </body>
    </html>
    """

    # Attach the HTML to the message
    part = MIMEText(html, "html")
    message.attach(part)
    
    try:
        print(f"🔌 Connecting to Gmail SMTP Server (SSL) on port {settings.SMTP_PORT}...")
        
        with smtplib.SMTP_SSL(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            
            print("🔐 Logging in...")
            server.login(sender_email, sender_password)
            
            print("📤 Sending email...")
            server.sendmail(sender_email, to_email, message.as_string())
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ FAILED TO SEND EMAIL: {e}")
        return False