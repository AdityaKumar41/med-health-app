import { usePatient } from '@/hooks/usePatient';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAccount } from 'wagmi';

interface ChatMessage {
    sender: string;
    receiver: string;
    message: string;
    file_url?: string;
    file_type?: string;
    timestamp: Date;
}

interface ChatContextType {
    socket: Socket | null;
    sendMessage: (receiverId: string, message: string, file_url?: string, file_type?: string) => void;
    onlineUsers: Set<string>;  // Add this
    setUserOnline: (userId: string) => void;  // Add this
    setUserOffline: (userId: string) => void;  // Add this
}

const ChatContext = createContext<ChatContextType>({
    socket: null,
    sendMessage: () => { },
    onlineUsers: new Set(),
    setUserOnline: () => { },
    setUserOffline: () => { },
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const { address } = useAccount();
    const { data: patient } = usePatient(address!);

    useEffect(() => {
        try {
            const newSocket = io(process.env.EXPO_PUBLIC_SOCKET_URL!);

            newSocket.on('connect', () => {
                console.log('Socket connected successfully');
                // Emit user connected event when socket connects
                if (patient?.id) {
                    newSocket.emit('user-connected', { userId: patient.id });
                }
            });

            // Listen for online users updates
            newSocket.on('online-users', (users: string[]) => {
                setOnlineUsers(new Set(users));
            });

            // Listen for user connected events
            newSocket.on('user-connected', (userId: string) => {
                setOnlineUsers(prev => new Set([...prev, userId]));
            });

            // Listen for user disconnected events
            newSocket.on('user-disconnected', (userId: string) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            });

            setSocket(newSocket);

            return () => {
                if (patient?.id) {
                    newSocket.emit('user-disconnected', { userId: patient.id });
                }
                newSocket.close();
            };
        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    }, [patient?.id]);

    const setUserOnline = (userId: string) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const setUserOffline = (userId: string) => {
        setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
    };

    const sendMessage = (receiverId: string, message: string, file_url?: string, file_type?: string) => {
        if (!socket || !patient?.id) {
            console.error('Socket or patient ID not available');
            return;
        }

        const chatMessage: ChatMessage = {
            sender: patient.id,
            receiver: receiverId,
            message,
            timestamp: new Date(),
            file_url,
            file_type
        };

        try {
            socket.emit('private-message', chatMessage);
            console.log('Message sent:', chatMessage);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <ChatContext.Provider value={{
            socket,
            sendMessage,
            onlineUsers,
            setUserOnline,
            setUserOffline
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
