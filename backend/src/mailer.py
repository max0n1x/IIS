import smtpd
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.application import MIMEApplication
from email.header import Header
from email.utils import formataddr

from src.config import MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD

class Mailer:
    def __init__(self):
        self.server = smtplib.SMTP(MAIL_HOST, MAIL_PORT)
        self.server.starttls()
        self.server.login(MAIL_USER, MAIL_PASSWORD)

    def send_code(self, to : str, code : str) -> bool:
        msg = MIMEMultipart()
        msg['From'] = formataddr((str(Header('Email verification', 'utf-8')), MAIL_USER))
        msg['To'] = to
        msg['Subject'] = 'Verification code'

        html_content = f"""
                <html>
                <head></head>
                <body>
                    <p>Your verification code is:</p>
                    <p style="font-size: 20px;"><u>{code}</u></p>
                </body>
                </html>
        """
        msg.attach(MIMEText(html_content, 'html'))

        try:
            self.server.send_message(msg)
            del msg
            return True
        except Exception as e:
            print(e)
            return False
        
    def send_password_reset(self, to : str, link : str) -> bool:
        msg = MIMEMultipart()
        msg['From'] = formataddr((str(Header('Password reset', 'utf-8')), MAIL_USER))
        msg['To'] = to
        msg['Subject'] = 'Password reset'

        html_content = f"""
                <html>
                <head></head>
                <body>
                    <p>Click the link below to reset your password:</p>
                    <a href="{link}">{link}</a>
                </body>
                </html>
        """
        msg.attach(MIMEText(html_content, 'html'))

        try:
            self.server.send_message(msg)
            del msg
            return True
        except Exception as e:
            print(e)
            return False

