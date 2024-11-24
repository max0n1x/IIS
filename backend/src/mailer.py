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
        self.server = smtplib.SMTP("smtp.gmail.com", 587)
        self.server.starttls()
        # self.server.login(""

    def send(self, to: str, subject: str, body: str, attachments: list[str] = []) -> None:
        msg = MIMEMultipart()
        msg['From'] = formataddr((str(Header('Garage sale', 'utf-8')), MAIL_USER))
        msg['To'] = to
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        for attachment in attachments:
            with open(attachment, 'rb') as f:
                part = MIMEApplication(f.read(), Name=attachment)
                part['Content-Disposition'] = f'attachment; filename="{attachment}"'
                msg.attach(part)

        self.server.send_message(msg)
        del msg

