from fastapi import WebSocket
from src.sql import Database

#TODO: Finish migration
class SocketsManager:
    def __init__(self) -> None:
        self.activeChatsSockets: list[dict] = []
        self.activeMessagesSockets: list[dict] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()

    async def disconnect(self, websocket: WebSocket) -> None:
        await websocket.close()

    async def receive(self, websocket: WebSocket) -> any:
        return await websocket.receive_json()
    
    async def sent(self, websocket: WebSocket, message: dict) -> None:
        await websocket.send_json(message)

    async def broadcast(self, db: Database, chat_id: int, user_id: int, vKey: str, message: dict) -> None:
        res = db.get_chat(chat_id, user_id, vKey)
        user_from, user_to = res.get('user_from'), res.get('user_to')
        for messageSocket in self.activeMessagesSockets:
            if int(messageSocket.get('user_id')) == int(user_from) or int(messageSocket.get('user_id')) == int(user_to):
                await self.sent(messageSocket.get('websocket'), message)

    async def user_closed_session(self, websocket: WebSocket) -> None:
        for chatSocket in self.activeChatsSockets:
            if chatSocket['websocket'] == websocket:
                self.activeChatsSockets.remove(chatSocket)
                return

        for messageSocket in self.activeMessagesSockets:
            if messageSocket['websocket'] == websocket:
                self.activeMessagesSockets.remove(messageSocket)
                return
            
    async def authorize(self, db: Database, websocket: WebSocket, user_id: int, vKey: str) -> bool:
        if db.check_validation_key(user_id, vKey):

            if {'user_id': user_id, 'vKey': vKey, 'websocket': websocket} not in self.activeMessagesSockets:
                self.activeMessagesSockets.append({'user_id': user_id, 'vKey': vKey, 'websocket': websocket})

            await self.sent(websocket, {'type' : 'system', 'message': 'Authorized'})

            return True
        else:
            await self.sent(websocket, {'type' : 'system', 'message': 'Unauthorized'})

            return False
        
    async def parse_message_action(self, db: Database, websocket: WebSocket, data : any) -> None:
        if data.get('action') == 'get_messages':
            messages = db.get_messages(data.get('chat_id'), data.get('user_id'), data.get('vKey'))
            if messages is not None:
                await websocket.send_json({'type' : 'messages', 'messages': messages})
            else:
                await websocket.send_json({'type' : 'system', 'status': 'NOK', 'message': 'Server error'})

        elif data.get('action') == 'send_message':
            if db.create_message(data.get('chat_id'), data.get('message'), 
                                    data.get('timestamp'), data.get('author_id'), data.get('vKey')):
                await websocket.send_json({'type' : 'system', 'status': 'OK'})
                messages = db.get_messages(data.get('chat_id'), data.get('user_id'), data.get('vKey'))
                await self.broadcast(db, data.get('chat_id'), data.get('author_id'), data.get('vKey'), {'type' : 'messages', 'messages': messages})

            else:
                await websocket.send_json({'type' : 'system', 'status': 'NOK', 'message': 'Server error'})

        elif data.get('action') == 'edit_message':
            if db.update_message(data.get('message_id'), data.get('message'), data.get('author_id'), data.get('vKey')):
                await websocket.send_json({'type' : 'system', 'status': 'OK'})
                messages = db.get_messages(data.get('chat_id'), data.get('author_id'), data.get('vKey'))
                await self.broadcast(db, data.get('chat_id'), data.get('author_id'), data.get('vKey'), {'type' : 'messages', 'messages': messages})
            else:
                await self.sent(websocket, {'type' : 'system', 'status': 'NOK', 'message': 'Server error'})

        elif data.get('action') == 'delete_message':
            if db.delete_message(data.get('message_id'), data.get('user_id'), data.get('vKey')):
                await websocket.send_json({'type' : 'system', 'status': 'OK'})
                messages = db.get_messages(data.get('chat_id'), data.get('user_id'), data.get('vKey'))
                await self.broadcast(db, data.get('chat_id'), data.get('user_id'), data.get('vKey'), {'type' : 'messages', 'messages': messages})
            else:
                await websocket.send_json({'type' : 'system', 'status': 'NOK', 'message': 'Server error'})







    