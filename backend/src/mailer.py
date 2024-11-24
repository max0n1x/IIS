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
        msg.attach(MIMEText(f'Your verification code is: {code}', 'plain'))

        try:
            self.server.send_message(msg)
            del msg
            return True
        except Exception as e:
            print(e)
            return False

