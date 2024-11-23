from fastapi import WebSocket, WebSocketDisconnect

#TODO: Finish migration
class ConnectionManager:
    def __init__(self) -> None:
        self.activeChatsSockets: list[dict[]]
        self.activeMessagesSockets: dict[int, dict[int, list[str]]] = {}

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()

    