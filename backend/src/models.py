"""
 * Project: IIS project - Garage sale website
 * @file models.py

 * @brief models for api

 * @author Maksym Podhornyi - xpodho08

"""


from typing import Optional
from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: Optional[str]
    price: float
    size: Optional[str]
    conditionId: str
    categoryId: str
    image_path: str
    author_id: int
    vKey: Optional[str]

class ItemUpdate(BaseModel):
    item_id: int
    author_id: int
    vKey: str
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    size: Optional[str] = None
    conditionId: Optional[str] = None
    categoryId: Optional[str] = None
    image_path: Optional[str] = None

class User(BaseModel):
    password: str
    username: Optional[str] = None
    email: str

class UserVerify(BaseModel):
    email: str
    code: str

class UserEmail(BaseModel):
    email: str

class CookieUser(BaseModel):
    user_id: int
    vKey: str

class CookieChatUser(BaseModel):
    user_id: int
    vKey: str
    chat_id: int
    
class UserUpdate(BaseModel):
    user_id: int
    vKey: str
    name : Optional[str]
    surname : Optional[str]
    phone: Optional[str]
    address: Optional[str]
    date_of_birth: Optional[str]

class Chat(BaseModel):
    user_from: int
    vKey: str
    user_to: int
    item_id: int

class ChatMessage(BaseModel):
    chat_id: int
    message: str
    date: str
    author_id: int
    vKey: str

class ChatMessageUpdate(BaseModel):
    message: str
    message_id: int
    author_id: int
    vKey: str

class ChatMessageDelete(BaseModel):
    message_id: int
    author_id: int
    vKey: str

class Token(BaseModel):
    token: str

class PasswordReset(BaseModel):
    token : str
    password : str

class Report(BaseModel):
    item_id: int
    reason: str

class GetReport(BaseModel):
    report_id: int
    user_id: int
    vKey: str

class ReportResolve(BaseModel):
    report_id: int
    action : str
    ban_duration : Optional[str] = None
    user_id: int
    vKey: str

class MailChange(BaseModel):
    user_id: int
    admin_id: int
    vKey: str
    new_email: str

class PromoteUser(BaseModel):
    user_id: int
    admin_id: int
    vKey: str

class BanUser(BaseModel):
    user_id: int
    admin_id: int
    vKey: str
    duration: str

class ItemAction(BaseModel):
    item_id: int
    user_id: int
    vKey: str
    action : str

    