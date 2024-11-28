import { createContext } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';
// Create the socket connection

const socket = io(`${API_URL}`);
// const socket = io('https://4cg9908h-8800.inc1.devtunnels.ms');


socket.emit('connection');

export const SocketContext = createContext()
export const SocketContextProvider = ({children}) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

