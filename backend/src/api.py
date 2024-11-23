"""
 * Project: IIS project - Garage sale website
 * @file api.py

 * @brief main file for api

 * @author Maksym Podhornyi - xpodho08

"""

from fastapi import FastAPI, HTTPException, UploadFile, Response, WebSocket, WebSocketDisconnect
import uvicorn
from src.config import ENDPOINT_HOST, ENDPOINT_PORT
from src.sql import Database
from fastapi.middleware.cors import CORSMiddleware
from src.models import *
from src.sockets import SocketsManager
from src.imgur import ImageUploader
from datetime import datetime, timedelta, timezone
import logging

app = FastAPI()

db = Database()
manager = SocketsManager()

logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://garage-sale.cz"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

@app.get('/api/v1.0')
async def root() -> dict:
    return {"message": "Oops, you are not supposed to be here"}

"""
    * THIS SECTION IS MAYBE WILL BE DEPRECATED AND MIGRATED TO WEBSOCKETS
"""
#------------------- CHAT -------------------#
@app.post('/api/v1.0/chat/create')
async def create_chat(chat: Chat) -> int:
    res = db.create_chat(**chat.dict())
    if res:
        return res
    raise HTTPException(status_code=500, detail='Server error')

@app.post('/api/v1.0/chat/delete')
async def delete_chat(user : CookieChatUser) -> bool:
    if db.delete_chat(user.chat_id, user.user_id, user.vKey):
        return True
    raise HTTPException(status_code=500, detail='Server error')

@app.post('/api/v1.0/chat')
async def get_chat(user : CookieChatUser) -> dict:
    chat = db.get_chat(user.chat_id, user.user_id, user.vKey)
    if chat:
        return chat
    raise HTTPException(status_code=500, detail='Server error')

@app.post('/api/v1.0/user/chats')
async def get_chats(user : CookieUser) -> list[dict]:
    chats = db.get_chats(user.user_id, user.vKey)
    if chats is not None:
        return chats
    raise HTTPException(status_code=500, detail='Server error')

@app.post('/api/v1.0/chat/messages')
async def get_messages(user : CookieChatUser) -> list[dict]:
    messages = db.get_messages(user.chat_id, user.user_id, user.vKey)
    if messages is not None:
        return messages
    raise HTTPException(status_code=500, detail='Server error')

@app.post('/api/v1.0/message/create')
async def create_message(message: ChatMessage) -> bool:
    if db.create_message(**message.dict()):
        return True
    raise HTTPException(status_code=500, detail='Server error')

@app.post('/api/v1.0/message/delete')
async def delete_message(message : ChatMessageDelete) -> bool:
    if db.delete_message(message.message_id, message.author_id, message.vKey):
        return True
    raise HTTPException(status_code=500, detail='Server error')

@app.post('/api/v1.0/message/update')
async def update_message(message: ChatMessageUpdate) -> bool:
    if db.update_message(**message.dict()):
        return True
    raise HTTPException(status_code=500, detail='Server error')

#------------------- CHAT END -------------------#

"""
    * THIS SECTION IS MAYBE WILL BE REPLACED OLD CHAT SECTION
"""
#------------------- NEW_CHAT -------------------#

activeMessagesSockets, activeChatsSockets = [], []

@app.websocket('/api/v1.0/new/chat')
async def chat(websocket: WebSocket) -> None:
    try:
        await manager.connect(websocket)
        is_authorized = False

        while True:
            data = await manager.receive(websocket)
            if not is_authorized:
                user_id = data.get('user_id')
                vKey = data.get('vKey')
                if await manager.authorize(db, websocket, user_id, vKey):
                    is_authorized = True
                else:
                    await manager.disconnect(websocket)
                    break

            if is_authorized:
                await manager.parse_message_action(db, websocket, data)

    except WebSocketDisconnect:
        await manager.user_closed_session(websocket)

@app.websocket('/api/v1.0/new/chats')
async def user_chats(websocket: WebSocket) -> None:
    try:
        await manager.connect(websocket)
        is_authorized = False
        while True:
            data = await manager.receive(websocket)
            if not is_authorized:
                user_id = data.get('user_id')
                vKey = data.get('vKey')
                if await manager.authorize(db, websocket, user_id, vKey):
                    is_authorized = True
                    await websocket.send_json({'type' : 'chats', 'chats': db.get_chats(user_id, vKey)})
                else:
                    await manager.disconnect(websocket)
                    break

            if is_authorized:
                pass

    except WebSocketDisconnect:
        await manager.user_closed_session(websocket)

@app.post('/api/v1.0/image/upload')
async def upload_image(image: UploadFile = None) -> dict:
    if image:
        uploader = ImageUploader()
        return {"url" : uploader.upload(image.file.read())}
    raise HTTPException(status_code=400, detail='No image provided')


@app.post('/api/v1.0/user/unauthorized')
async def unauthorized_user() -> bool:
    if db.unauthorized_user() >= 0:
        return True
    raise HTTPException(status_code=500, detail='Server error')


@app.post('/api/v1.0/register')
async def user_registration(user : User) -> bool:
    """ register a new user """
    status = db.register_user(**user.dict())
    if status == 0:
        return True
    elif status == -1:
        raise HTTPException(status_code=409, detail='Username already taken')
    elif status == -2:
        raise HTTPException(status_code=400, detail='Username or password is empty')
    else:
        raise HTTPException(status_code=500, detail='Server error')


@app.post('/api/v1.0/login')
async def user_login(user : User, response: Response) -> dict:
    """ login a user and set cookie """
    user_id, validation_hash = db.login_user(**user.dict())
    if user_id >= 0:

        response.set_cookie(
            key="user_id",
            value=user_id,
            max_age=4 * 60 * 60,
            path="/",
            samesite="lax",
        )

        response.set_cookie(
            key="vKey",
            value=validation_hash,
            max_age=4 * 60 * 60,
            path="/",
            samesite="lax",
        )

        return {"Status": "Logged in"}
    elif user_id == -1:
        raise HTTPException(status_code=404, detail='User not found')
    elif user_id == -2:
        raise HTTPException(status_code=401, detail='Incorrect username or password')
    else:
        raise HTTPException(status_code=500, detail='Server error')

@app.post('/api/v1.0/user/update')
async def user_update(user : UserUpdate) -> bool:
    """ update user data """
    if db.update_user(**user.dict(exclude_unset=True)):
        return True
    else:
        raise HTTPException(status_code=500, detail='Server error')

@app.post('/api/v1.0/user')
async def get_user(user : CookieUser) -> dict:
    user = db.get_user(**user.dict())
    if user:
        return user
    raise HTTPException(status_code = 500, detail='Server error')

@app.get('/api/v1.0/public/user/{user_id}')
async def get_user_by_id(user_id: int) -> dict:
    user = db.get_user_by_id(user_id)
    if user:
        return user
    raise HTTPException(status_code = 500, detail='Server error')
    
@app.post('/api/v1.0/user/items')
async def get_user_items(user : CookieUser) -> list[dict]:
    items = db.get_user_items_bd(user.user_id, user.vKey)
    if items:
        return items
    elif items == []:
        return []
    raise HTTPException(status_code = 500, detail='Server error')

@app.post('/api/v1.0/user/logout')
async def user_logout(user : CookieUser) -> bool:
    if db.logout_user(**user.dict()):
        return True
    else:
        raise HTTPException(status_code=500, detail='Server error')
        

@app.post('/api/v1.0/user/delete')
async def delete_user(user : CookieUser) -> bool:
    if db.delete_user():
        return True
    raise HTTPException(status_code=500, detail='Server error')


@app.get('/api/v1.0/items/{category_id}/category')
async def get_items(category_id: str) -> list[dict]:
    return db.get_items(category_id)


@app.get('/api/v1.0/items/{item_id}')
async def get_item(item_id: int) -> dict:
    item = db.get_item(item_id)
    if item:
        return item
    raise HTTPException(status_code=404, detail='Item not found')


@app.post('/api/v1.0/item/create')
async def create_item(item: Item) -> dict:
    if db.insert_item(**item.dict()):
        return item
    raise HTTPException(status_code=500, detail='Server error')


@app.post('/api/v1.0/item/delete')
async def delete_item(item : ItemUpdate) -> dict:
    if db.delete_item(item.item_id, item.author_id, item.vKey):
        return {'message': 'Item deleted'}
    raise HTTPException(status_code=500, detail='Server error')


@app.post('/api/v1.0/item/update')
async def update_item(item: ItemUpdate) -> bool:
    sucess = db.update_item(**item.dict(exclude_unset=True))
    if sucess:
        return True
    else:
        raise HTTPException(status_code=500, detail='Server error')


def run():
    uvicorn.run(app, host=ENDPOINT_HOST, port=ENDPOINT_PORT, log_level='info')
