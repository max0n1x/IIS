/*
 * Project: ITU project - Garage sale website
 * @file ChatsPage.js

 * @brief ReactJS component of the chats page of the website

 * @author Maksym Podhornyi - xpodho08
*/

import React, {useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fixElementHeight, checkLogin, Header, API_BASE_URL, GetItem } from "../Utils";
import user_svg from "../images/user.svg";
import ChatsPageStyles from "./ChatsPage.module.css";
import sendIcon from "../images/ArrowCircleRight.svg";
import "../GlobalStyles.css";
import trashBin from "../images/trashbin.svg";
import editMessage from "../images/EditMessage.svg"
import { CodeGen } from "ajv";

const ChatsPage: React.FC = () => {
    const headerRef = useRef<HTMLDivElement>(null);
    const logInRef = useRef<HTMLAnchorElement>(null);
    const loggedIn = useRef<HTMLAnchorElement>(null);
    const navigate = useNavigate();

    const chatsRef = useRef(null);
    const chatHeader = useRef<HTMLSpanElement>(null);
    const chatImage = useRef<HTMLImageElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatContainer = useRef<HTMLDivElement>(null);
    const emptyChatContainer = useRef<HTMLDivElement>(null);

    const [chats_state, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [messageId, setMessageId] = useState<string | null>(null);

    const [chat_id, setChatId] = useState<string | null>(null);
    const [item_id, setItemId] = useState<string | null>(null);         

    const [error, setError] = useState('');

    const fetchInterval = useRef<number | NodeJS.Timeout | null>(null);

    const location = useLocation();

    interface Message {
        message: string;
        user_from: string;
        id: string | number;
    }

    interface Chat {
        chat_id: string;
        item_id: string;
        username: string;
        item_name: string;
    }

    const addChat = (username : string, item_name : string, chat_id : string, item_id : string) => {
        return (
            <div className={ChatsPageStyles['one-chat-container']} key = {chat_id} onClick={openChat} id = {chat_id}
            data-item-id = {item_id}>
                <img src={user_svg} alt="Upload" className={ChatsPageStyles["chat-user-image"]}/>
                <span className={ChatsPageStyles["user-id-label"]}>User: {username}</span>
                <span className={ChatsPageStyles["item-id-label"]}>Item: {item_name}</span>
            </div>
        );
    }

    const addMessage = (message : string, isMine : string, id : number) => {
        const cookie = document.cookie.split(';').find(cookie => cookie.includes('user_id'));

        if (!cookie) {
            navigate('/login');
            return;
        }

        const userId = cookie.split('=')[1];
    

        if (cookie === undefined) {
            navigate('/login');
            return;
        }

        if (parseInt(isMine) === parseInt(userId)) {
            return (
                <div className={ChatsPageStyles['each-chat-message-container-mine']} key = {id} data-message-id = {id}>
                    <span className={ChatsPageStyles['each-chat-message']}>{message}</span>
                    <img src={trashBin} alt="sent" className={ChatsPageStyles["trash-bin"]} onClick={handleDeleteMessage}/>
                    <img src={editMessage} alt="sent" className={ChatsPageStyles["edit-message"]} onClick={handleEditMessage}/>
                </div>
            );
        } else {
            return (
                <div className={ChatsPageStyles['each-chat-message-container-yours']} key = {id}>
                    <span className={ChatsPageStyles['each-chat-message']}>{message}</span>
                </div>
            );
        }
    }

    const handleDeleteChat = async() => {

        if (!chatHeader.current) {
            return;
        }

        const chat_id = chatHeader.current.dataset.chatId;
        const user_id = document.cookie.split(';').find(cookie => cookie.includes('user_id'))?.split('=')[1] || null;
        const vKey = document.cookie.split(';').find(cookie => cookie.includes('vKey'))?.split('=')[1] || null;

        if (!user_id || !vKey) {
            navigate('/login');
            return;
        }

        const response = await fetch(API_BASE_URL + "/chat/delete", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({chat_id: chat_id, user_id: user_id, vKey: vKey})
        });

        const result = await response.json();

        if (response.ok && emptyChatContainer.current && chatContainer.current) {
            emptyChatContainer.current.style.display = "flex";
            chatContainer.current.style.display = "none";

            if (fetchInterval.current) {
                clearInterval(fetchInterval.current as number | NodeJS.Timeout);
            }

            await fetchChats();
        } else {
            setError(result.message);
        }
    }

    const handleDeleteMessage = async(event: React.MouseEvent) => {
        event.preventDefault();

        const message_id = (event.target as HTMLImageElement).parentNode
            ? ((event.target as HTMLImageElement).parentNode as HTMLDivElement).getAttribute('data-message-id')
            : null;


        const user_id = document.cookie.split(';').find(cookie => cookie.includes('user_id'))?.split('=')[1] || null;
        const vKey = document.cookie.split(';').find(cookie => cookie.includes('vKey'))?.split('=')[1] || null;

        if (!user_id || !vKey) {
            navigate('/login');
            return;
        }

        const response = await fetch(API_BASE_URL + "/message/delete", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message_id: message_id, author_id: user_id, vKey: vKey})
        });

        const result = await response.json();

        if (response.ok) {
            if (chatHeader.current) {
                await fetchMessages(chatHeader.current.dataset.chatId);
            }
        } else {
            setError(result.message);
        }
    }

    const handleEditMessage = async(event : React.MouseEvent) => {
        event.preventDefault();
        const message_id = (event.target as HTMLImageElement).parentNode ? 
                ((event.target as HTMLImageElement).parentNode as HTMLDivElement).getAttribute('data-message-id') : null;

        const message_span = (event.target as HTMLImageElement).parentNode 
            ? ((event.target as HTMLImageElement).parentNode as HTMLDivElement).childNodes[0] as HTMLSpanElement
            : null;

        const message = message_span ? message_span.innerHTML : "";
            
        setMessage(message);

        if (inputRef.current) {
            inputRef.current.focus();
        }
        
        setIsEditing(true);
        setMessageId(message_id);
    }
    
    const setMessageHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };    

    const keyDownHandle = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            await handleSent();
        }
    };    

    const handleSent = async() => {
        const user_from = document.cookie
            .split(';')
            .find(cookie => cookie.includes('user_id'))
            ?.split('=')[1] || null;

        const vKey = document.cookie
            .split(';')
            .find(cookie => cookie.includes('vKey'))
            ?.split('=')[1] || null;

        if (!chatHeader.current) {
            return;
        }

        if (!user_from || !vKey) {
            navigate('/login');
            return;
        }

        const chat_id = chatHeader.current.dataset.chatId
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        if (message === "") {
            return;
        }

        if (isEditing) {

            if (!messageId) {
                return;
            }

            const data = {
                message_id: messageId,
                message: message,
                author_id: user_from,
                vKey: vKey
            }

            const response = await fetch(API_BASE_URL + "/message/update", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });

            await response.json();

            await fetchMessages(chat_id);

            setMessage("");
            setIsEditing(false);
            setMessageId(null);

            return;
        } else {


            const data = {
                message: message,
                user_from: user_from,
                date: timestamp,
                chat_id: chat_id,
                author_id: user_from,
                vKey: vKey
            }

            const response = await fetch(API_BASE_URL + "/message/create", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });

            await response.json();

            setMessage("");

            await fetchMessages(chat_id);

            return;
        }
    }

    const fetchMessages = useCallback(async(chat_id : string | undefined) => {

        if (!chat_id) {
            return;
        }

        const user_id = document.cookie.split(';').find(cookie => cookie.includes('user_id'))?.split('=')[1] || null;
        const vKey = document.cookie.split(';').find(cookie => cookie.includes('vKey'))?.split('=')[1] || null;

        if (!user_id || !vKey) {
            navigate('/login');
            return;
        }

        const response = await fetch(API_BASE_URL + "/chat/messages", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({chat_id: chat_id, user_id: user_id, vKey: vKey})
        });

        const data = await response.json();

        const messages: Message[] = [];
        for (const message of data) {
            messages.push({message: message.message, user_from: message.user_from, id: message.message_id});
        }

        setMessages(messages.reverse());
    } , [navigate]);

    const openChat = useCallback(async(event?: React.MouseEvent<HTMLDivElement> | null | boolean, chat_id?: string, item_id?: string) => {
        
        if (emptyChatContainer.current && chatContainer.current) {
            emptyChatContainer.current.style.display = "none";
            chatContainer.current.style.display = "flex";
        }

        if (chat_id === undefined && item_id === undefined) {
            if (event && typeof event !== 'boolean') {
                if ((event.target as HTMLElement).className === ChatsPageStyles['one-chat-container']) {
                    chat_id = (event.target as HTMLElement).id;
                    item_id = (event.target as HTMLElement).getAttribute('data-item-id') || '';
                } else {
                    const parentNode = (event.target as HTMLElement).parentNode as HTMLElement;
                    chat_id = parentNode.id;
                    item_id = parentNode.getAttribute('data-item-id') || '';
                }
            }
        }

        if (!chat_id || !item_id) {
            return;
        }
        
        await GetItem(item_id).then((item) => {
            if (item.name.length > 30) {
                item.name = item.name.substring(0, 30) + "...";
            }

            if (chatHeader.current) {
                chatHeader.current.innerHTML = item.name;
            }

            if (chatHeader.current) {
                chatHeader.current.dataset.chatId = chat_id;
            }
           
            if (item.image_path && chatImage.current) {
                chatImage.current.src = item.image_path;
            }
        }
        );

        await fetchMessages(chat_id);

        if (fetchInterval.current) {
            clearInterval(fetchInterval.current as number | NodeJS.Timeout);
        }

        fetchInterval.current = setInterval(async() => {
            await fetchMessages(chat_id);
        }
        , 2000);

    }, [fetchMessages]);

    const fetchChats = useCallback(async() => {
        const cookies = document.cookie.split(';');
        if (!cookies) {
            navigate('/login');
            return;
        }

        const user = cookies.find(cookie => cookie.includes('user_id'));
        const vKey = cookies.find(cookie => cookie.includes('vKey'));

        if(!user || !vKey) {
            navigate('/login');
            return;
        }

        const response = await fetch(API_BASE_URL + "/user/chats", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user_id: parseInt(user.split('=')[1]), vKey: vKey.split('=')[1]})
        });

        const data = await response.json();
        const newChats: Chat[] = [];

        const validChatIds = new Set(data.map((chat: any) => chat.chat_id));

        for (const chat of data) {
            const chatExists = chats_state.some(existingChat => existingChat.chat_id === chat.chat_id);
            if (!chatExists) {
                const item = await GetItem(chat.item_id);
                if (item.name.length > 15) {
                    item.name = item.name.substring(0, 15) + "...";
                }
                const userResponse = await fetch(API_BASE_URL + "/public/user/" + (chat.user_from === parseInt(user.split('=')[1]) ? chat.user_to : chat.user_from), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const userData = await userResponse.json();
                if (userData.username.length > 12) {
                    userData.username = userData.username.substring(0, 12) + "...";
                }
                newChats.push({
                    username: userData.username,
                    item_name: item.name,
                    item_id: chat.item_id,
                    chat_id: chat.chat_id
                });
            }
        }

        const updatedChats = chats_state.filter(existingChat =>
            validChatIds.has(existingChat.chat_id)
        );

        setChats([...updatedChats, ...newChats]);

    } , [chats_state, navigate]);

    useEffect(() => {

        if (chatContainer.current && emptyChatContainer.current) {
            console.log("blya");
            emptyChatContainer.current.style.display = "flex";
            chatContainer.current.style.display = "none";
        }

    } , []);

    useEffect(() => {

        const chatsUpdate = setInterval(async() => {
            await fetchChats();
        }
        , 2000);

        return () => {
            clearInterval(chatsUpdate);
        }

    } , [fetchChats]);

    useEffect(() => {
        if (headerRef.current) {
            fixElementHeight(headerRef.current);
        }

        const verifyLoginStatus = async () => {
            await checkLogin(loggedIn, logInRef).then((result) => {
                if (!result) {
                    navigate('/login');
                }
            });
        };

        verifyLoginStatus();

    } , [navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setChatId(params.get('chat_id'));
        setItemId(params.get('item_id'));

        if (chat_id && item_id) {
            openChat(null, chat_id, item_id);
            navigate('/user/chats');
        }

        return () => {
            if (fetchInterval.current) {
                clearInterval(fetchInterval.current);
            }
        }
    }
    , [fetchInterval, location, openChat, chat_id, item_id]);

    return(

        <div>
            <Header headerRef={headerRef} logInRef={logInRef} loggedIn={loggedIn} />

            <div className={ChatsPageStyles['main-container']}>

                <div className={ChatsPageStyles['caption-container']}>
                    <p className={ChatsPageStyles['caption']}>YOUR CHATS<br /> </p>
                </div>

                <div className={ChatsPageStyles['chats-container']} ref = {chatsRef}>

                    {chats_state.map(chat => addChat(chat.username, chat.item_name, chat.chat_id, chat.item_id))}

                </div>

                <div className={ChatsPageStyles['each-chat-container']} ref = {chatContainer}>
                    <div className={ChatsPageStyles['each-chat-header']} >
                        <img src={user_svg} alt="Upload" className={ChatsPageStyles["chat-item-image"]} ref = {chatImage} />
                        <span className={ChatsPageStyles["item-id-header"]} ref = {chatHeader}></span>
                        <img src={trashBin} alt="Delete" className={ChatsPageStyles["each-chat-delete"]} onClick={handleDeleteChat} />
                    </div>
                    <div className={ChatsPageStyles['each-chat-messages']}>
                        {messages.map(message => addMessage(message.message, message.user_from, Number(message.id)))}
                    </div>

                    <div className={ChatsPageStyles['each-chat-input-container']}>
                        <input type="text" className={ChatsPageStyles['each-chat-input']} placeholder="Type a message..." onChange={setMessageHandle} value={message}
                        onKeyDown={keyDownHandle} ref = {inputRef}/>
                        <img src={sendIcon} alt="sent" className={ChatsPageStyles["send-icon"]} onClick={handleSent} />
                    </div>

                    {error && <div className={ChatsPageStyles['error']}>{error}</div>}
                </div>

                <div className={ChatsPageStyles['each-chat-container']} ref = {emptyChatContainer}>
                    <span className={ChatsPageStyles['empty-chat']}>Select a chat to start messaging</span>
                </div>
            </div>
        </div>
    );

}
export default ChatsPage;