import React, { useEffect, useState } from "react";
import { useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { SendHorizonalIcon } from "lucide-react";
import { SocketContext } from "../context/SocketContext.jsx";

export default function ChatBox({ roomSocketId }){
    const { currentUser } = useContext(AuthContext) 
    const socket = useContext(SocketContext)
    const audio = new Audio('/assets/ding.mp3');
    const [chats, setChats] = useState([])
    const textareaRef = useRef(null);

    useEffect(() => {
        socket.on('message', message => {
            
            setChats(prevChats => {
                return [...prevChats, message]
            })
            audio.play()
        })
        const textarea = textareaRef.current;
        const parentDiv = textarea.parentNode.parentNode;
        const maxHeight = parentDiv.parentNode.clientHeight * 0.4;

        const adjustHeight = () => {
            textarea.style.height = 'auto';
            if (textarea.scrollHeight < maxHeight) {
                textarea.style.height = `${textarea.scrollHeight}px`;
            } else {
                textarea.style.height = `${maxHeight}px`;
            }
        };

        adjustHeight();
        textarea.addEventListener('input', adjustHeight);

        return () => {
            textarea.removeEventListener('input', adjustHeight);
            socket.off('message')
        };
    }, []);

    const sendMessage = () => {
        socket.emit('send-message', roomSocketId, {username: currentUser.username, text: textareaRef.current.value})
        textareaRef.current.value = ""
        textareaRef.current.style.height = 'auto'
    }

    return (
        <div className="bg-primary-blue flex flex-col p-4 justify-between overflow-y-auto rounded-md lg:mt-0 lg:h-full mt-4 h-[100%]">
            <div className="overflow-y-auto flex-grow mb-2">
                {
                    chats.map(chat => {
                        return (
                            <div className="bg-secondary-blue text-black w-full h-auto p-2 font-semibold rounded-md mb-4">
                                <div className="border-b-2 border-black pb-1 mb-1">{chat.username}</div>
                                <p className="whitespace-pre-wrap break-words">{chat.text}</p>
                            </div> 
                        )
                    })
                }
            </div>
            <div className="flex flex-row items-start">
                <textarea ref={textareaRef} className="h-full w-full px-2 py-2 overflow-auto rounded-md font-semibold text-lg focus:outline-none" placeholder="message"/>
                <button className="bg-secondary-blue p-3 rounded-md ml-2 hover:bg-blue-400" onClick={sendMessage}>
                    <SendHorizonalIcon/>
                </button>
            </div>
        </div>
    );
}
    