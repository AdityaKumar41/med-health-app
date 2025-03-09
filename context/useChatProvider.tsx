import { usePatient } from '@/hooks/usePatient';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAccount } from 'wagmi';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Setup notifications configuration
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

interface ChatMessage {
    sender: string;
    receiver: string;
    message: string;
    file_url?: string;
    file_type?: string;
    timestamp: Date;
    sender_name?: string; // Add this for notifications
}

interface ChatContextType {
    socket: Socket | null;
    sendMessage: (receiverId: string, message: string, file_url?: string, file_type?: string) => void;
    onlineUsers: Set<string>;
    setUserOnline: (userId: string) => void;
    setUserOffline: (userId: string) => void;
    activeChat: string | null; // Track active chat
    setActiveChat: (chatId: string | null) => void;
    requestNotificationPermissions: () => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType>({
    socket: null,
    sendMessage: () => { },
    onlineUsers: new Set(),
    setUserOnline: () => { },
    setUserOffline: () => { },
    activeChat: null,
    setActiveChat: () => { },
    requestNotificationPermissions: async () => false,
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

    const { address } = useAccount();
    const { data: patient } = usePatient(address!);
    const socketInitialized = useRef(false);

    // Request notification permissions
    const requestNotificationPermissions = async () => {
        try {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('chat-messages', {
                    name: 'Chat Messages',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#0066CC',
                });
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            const granted = finalStatus === 'granted';
            setHasNotificationPermission(granted);
            return granted;
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    };

    // Request permissions on mount
    useEffect(() => {
        requestNotificationPermissions();
    }, []);

    // Configure notification handling
    useEffect(() => {
        // Handle notification responses (when user taps notification)
        const notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;

            // Navigate to chat with this sender when notification is tapped
            if (data.senderId) {
                // We'll use this in the ChatRoom component to navigate
                console.log('Notification tapped with senderId:', data.senderId);
            }
        });

        return () => notificationSubscription.remove();
    }, []);

    useEffect(() => {
        // Prevent multiple socket connections
        if (socketInitialized.current) return;

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

            // Listen for private messages and show notifications if not in active chat
            newSocket.on('private-message', async (message: ChatMessage) => {
                // Only show notification if:
                // 1. Message is received by current user (patient)
                // 2. We're not actively chatting with the sender
                // 3. We have notification permission
                if (
                    patient?.id &&
                    message.receiver === patient.id &&
                    message.sender !== activeChat &&
                    hasNotificationPermission
                ) {
                    const senderName = message.sender_name || 'Doctor';
                    const notificationTitle = `New message from ${senderName}`;

                    // Format notification body based on message type
                    let notificationBody = message.message;
                    if (message.file_url) {
                        if (message.file_type?.includes('image')) {
                            notificationBody = '📷 Sent you an image';
                        } else if (message.file_type?.includes('pdf')) {
                            notificationBody = '📄 Sent you a document';
                        } else {
                            notificationBody = '📎 Sent you a file';
                        }
                    }

                    // Show notification
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: notificationTitle,
                            body: notificationBody,
                            data: {
                                senderId: message.sender,
                                senderName: senderName,
                            },
                        },
                        trigger: null, // null means show immediately
                    });
                }
            });

            setSocket(newSocket);
            socketInitialized.current = true;

            return () => {
                if (patient?.id) {
                    newSocket.emit('user-disconnected', { userId: patient.id });
                }
                newSocket.close();
                socketInitialized.current = false;
            };
        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    }, [patient?.id, activeChat, hasNotificationPermission]);

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
            file_type,
            sender_name: patient.name // Include sender name for notifications
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
            setUserOffline,
            activeChat,
            setActiveChat,
            requestNotificationPermissions
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
