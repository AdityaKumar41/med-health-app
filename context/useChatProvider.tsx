import { usePatient } from '@/hooks/usePatient';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAccount } from 'wagmi';

interface ChatContextType {
    socket: Socket | null;
    sendMessage: (receiverId: string, message: string) => void;
}

const ChatContext = createContext<ChatContextType>({
    socket: null,
    sendMessage: () => { },
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { address } = useAccount();
    const { data: patient } = usePatient(address!)

    useEffect(() => {
        const newSocket = io(process.env.EXPO_PUBLIC_SOCKET_URL!);
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const sendMessage = (receiverId: string, message: string) => {
        if (socket) {
            socket.emit('private-message', {
                sender: patient.id,
                receiver: receiverId,
                message,
                timestamp: new Date(),
            });
        }
    };

    return (
        <ChatContext.Provider value={{ socket, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
