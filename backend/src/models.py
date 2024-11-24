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
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    size: Optional[str]
    conditionId: Optional[str]
    categoryId: Optional[str]
    image_path: Optional[str]

class User(BaseModel):
    password: str
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

    