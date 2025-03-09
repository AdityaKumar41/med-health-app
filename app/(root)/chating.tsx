import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';
import { useChat } from '@/context/useChatProvider';
import { router, useNavigation } from 'expo-router';
import { Image } from 'react-native';
import { format } from 'date-fns';
import { usePatient } from '@/hooks/usePatient';
import { useAccount } from 'wagmi';
import { useLocalSearchParams } from 'expo-router';
import { useDoctorbyId } from '@/hooks/useDoctor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignedUrl } from '@/hooks/useAws';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Modal from 'react-native-modal';
import ReportViewer from '@/components/ReportViewer';
import { TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';

interface Message {
    receiver: string | string[];
    id?: string;
    sender: string;
    message: string;
    content?: string;
    timestamp: Date;
    sentAt?: Date;
    sender_id?: string;
    fileUrl?: string;
    file_url?: string; // Server-side naming convention
    fileType?: 'image' | 'pdf';
    file_type?: string; // Server-side naming convention
    fileName?: string;
}

const ChatRoom = () => {
    const { address } = useAccount();
    const { data: patient } = usePatient(address!);
    const navigation = useNavigation();

    // Get doctor details from params
    const { doctorId, doctorName, profilePicture, specialty, appointmentStatus } = useLocalSearchParams();

    // Get chat context with active chat tracking
    const { socket, sendMessage, onlineUsers, activeChat, setActiveChat } = useChat();

    // Enhanced status handling for all appointment statuses
    const isCompleted = appointmentStatus === 'completed';
    const isPending = appointmentStatus === 'pending';
    const isCancelled = appointmentStatus === 'cancelled';

    // Read-only for both Pending and Completed statuses
    const isReadOnlyChat = isCompleted || isPending || isCancelled;

    // Get appropriate status message based on appointment status
    const getStatusMessage = () => {
        if (isCompleted) {
            return "This appointment has been completed. You can view past messages but cannot send new ones.";
        } else if (isPending) {
            return "This appointment is pending approval. Chat will be available once approved.";
        } else if (isCancelled) {
            return "This appointment has been cancelled. The chat is now in read-only mode.";
        }
        return null;
    };

    // Get status banner styling based on appointment status
    const getStatusBannerStyle = () => {
        if (isCompleted) {
            return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" };
        } else if (isPending) {
            return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800" };
        } else if (isCancelled) {
            return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800" };
        }
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800" };
    };

    // Fetch doctor data as a backup, but use params if available
    const { data: doctorData, error: doctorError, isLoading: isDoctorLoading } = useDoctorbyId(doctorId as string);

    // Use passed params as the primary source, fall back to fetched data
    const doctor = {
        id: doctorId as string,
        name: doctorName as string || doctorData?.data?.name,
        profile_picture: profilePicture as string || doctorData?.data?.profile_picture,
        specialty: specialty as string || (doctorData?.data?.specialties ?
            doctorData.data.specialties.map((s: any) => s.name).join(', ') : '')
    };

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        if (doctorId) {
            // Mark this chat as active to prevent notifications
            setActiveChat(doctorId as string);
            console.log('Setting active chat:', doctorId);

            // Clear active chat when component unmounts
            return () => {
                console.log('Clearing active chat');
                setActiveChat(null);
            };
        }
    }, [doctorId, setActiveChat]);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { mutateAsync: getSignedUrl } = useSignedUrl(address || '');
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerContent, setViewerContent] = useState<{
        fileUrl: string;
        fileType: string;
        title: string;
    } | null>(null);

    // Add a reference to track if this is the initial load
    const isInitialRender = useRef(true);

    // Add skeleton message placeholders for better loading experience
    const skeletonMessages = [
        { isReceived: true },
        { isReceived: false },
        { isReceived: true },
    ];

    // Cache key for storing chat messages
    const getChatCacheKey = () => {
        return `chat_${patient?.id}_${doctorId}`;
    };

    // Load cached messages on initial mount
    useEffect(() => {
        const loadCachedMessages = async () => {
            try {
                const cacheKey = getChatCacheKey();
                const cachedMessages = await AsyncStorage.getItem(cacheKey);

                if (cachedMessages) {
                    const parsedMessages = JSON.parse(cachedMessages);
                    // Transform dates back to Date objects
                    const messagesWithDates = parsedMessages.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));

                    setMessages(messagesWithDates);
                    // Show cached data immediately, reducing perception of loading
                    setIsLoadingHistory(false);
                }
            } catch (error) {
                console.error('Failed to load cached messages:', error);
            }
        };

        loadCachedMessages();
    }, [doctorId, patient?.id]);

    // Add a message tracking ref to prevent duplicates
    const processedMessageIds = useRef(new Set<string>());

    // Socket connection and message handling with caching - UPDATED LOGIC
    useEffect(() => {
        if (!socket || !patient?.id) {
            console.log("Socket or patient ID not available yet");
            return;
        }

        console.log("Setting up socket listeners for patient:", patient.id, "and doctor:", doctorId);

        // First, let's handle the loading state
        setIsLoadingHistory(true);

        // Join the room with doctor ID (the server will match this with patient ID)
        socket.emit('join', { patientId: patient.id, doctorId: doctorId });

        // Request previous messages for this specific conversation
        // socket.emit('get-previous-messages', {
        //     patientId: patient.id,
        //     doctorId: doctorId
        // });

        // Set a timeout to ensure we don't show loading state for too long
        const loadingTimeout = setTimeout(() => {
            setIsLoadingHistory(false);
            setInitialLoadComplete(true);
            console.log("Loading timeout hit - setting loading to false");
        }, 3000);

        // Clear previous listeners before setting up new ones
        socket.off('previous-messages');
        socket.off('receive-message');

        // Listen for previous messages
        socket.on('previous-messages', (previousMessages) => {
            console.log("Received previous messages:", previousMessages);
            clearTimeout(loadingTimeout);

            if (previousMessages && Array.isArray(previousMessages) && previousMessages.length > 0) {
                // Transform the message format if needed
                const formattedPreviousMessages = previousMessages.map((msg) => ({
                    id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                    sender: msg.sender_id || msg.sender,
                    receiver: msg.receiver_id || msg.receiver,
                    message: msg.content || msg.message,
                    timestamp: new Date(msg.sentAt || msg.timestamp || Date.now()),
                    fileUrl: msg.file_url,
                    fileType: msg.file_type ? determineFileType(msg.file_type) : undefined,
                    fileName: extractFileName(msg.file_url || "")
                }));

                console.log("Formatted previous messages:", formattedPreviousMessages);

                // Track message IDs to prevent duplicates
                formattedPreviousMessages.forEach(msg => {
                    if (msg.id) processedMessageIds.current.add(msg.id);
                });

                // Update state with the properly formatted messages
                setMessages(formattedPreviousMessages);

                // Cache messages for future use
                try {
                    const cacheKey = getChatCacheKey();
                    AsyncStorage.setItem(cacheKey, JSON.stringify(formattedPreviousMessages));
                } catch (error) {
                    console.error('Failed to cache messages:', error);
                }
            } else {
                console.log("No previous messages found or invalid format");
                setMessages([]);
            }

            setIsLoadingHistory(false);
            setInitialLoadComplete(true);
        });

        // Listen for new messages
        socket.on('receive-message', (message) => {
            console.log("New message received:", message);

            // Skip if we've already processed this message
            if (message.id && processedMessageIds.current.has(message.id)) {
                console.log("Skipping already processed message:", message.id);
                return;
            }

            // IMPORTANT: Only process messages that belong to this conversation
            const isForThisConversation =
                // Doctor -> Patient
                (message.sender === doctorId && message.receiver === patient.id) ||
                // Patient -> Doctor
                (message.sender === patient.id && message.receiver === doctorId);

            console.log(
                "Message routing check:",
                `sender: ${message.sender}, receiver: ${message.receiver}`,
                `patientId: ${patient.id}, doctorId: ${doctorId}`,
                `isForThisConversation: ${isForThisConversation}`
            );

            if (!isForThisConversation) {
                console.log("Ignoring message not for this conversation");
                return;
            }

            // Format the received message
            const newMsg = {
                id: message.id || `msg-${Date.now()}-${Math.random()}`,
                sender: message.sender || message.sender_id,
                receiver: message.receiver || message.receiver_id,
                message: message.message || message.content,
                timestamp: new Date(message.timestamp || message.sentAt || Date.now()),
                fileUrl: message.file_url || message.fileUrl,
                fileType: message.file_type ? determineFileType(message.file_type) : message.fileType,
                fileName: message.fileName || extractFileName(message.file_url || message.fileUrl || '')
            };

            // Mark this message as processed
            if (newMsg.id) {
                processedMessageIds.current.add(newMsg.id);
            }

            // Update state
            setMessages(prev => {
                const updatedMessages = [...prev, newMsg];

                // Cache updated messages
                try {
                    const cacheKey = getChatCacheKey();
                    AsyncStorage.setItem(cacheKey, JSON.stringify(updatedMessages));
                } catch (error) {
                    console.error('Failed to update cached messages:', error);
                }

                return updatedMessages;
            });

            // Auto-scroll to bottom when new message arrives
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        // Cleanup function
        return () => {
            clearTimeout(loadingTimeout);
            socket.off('previous-messages');
            socket.off('receive-message');

            // Leave the chat room
            socket.emit('leave', { patientId: patient.id, doctorId: doctorId });
            console.log("Cleaned up socket listeners");
        };
    }, [socket, doctorId, patient?.id]);

    // Determine if we should show loading skeletons
    const shouldShowLoadingSkeletons = () => {
        // Only show skeletons on first load and if we have no cached messages
        return isLoadingHistory && isInitialRender.current && messages.length === 0;
    };

    // Mark initial render as complete after component mounts
    useEffect(() => {
        isInitialRender.current = false;
    }, []);

    // Modify the handleSend function to ensure messages get sent properly
    const handleSend = () => {
        if (!newMessage.trim() || !socket || !patient?.id || isReadOnlyChat) {
            if (isCompleted) {
                console.log("Cannot send message: Appointment is completed");
            } else if (isPending) {
                console.log("Cannot send message: Appointment is pending approval");
            } else if (isCancelled) {
                console.log("Cannot send message: Appointment is cancelled");
            } else {
                console.log("Cannot send: Empty message or missing socket/patient");
            }
            return;
        }

        console.log("Sending message to doctor:", doctorId, "Message:", newMessage);

        // Add the message locally to ensure immediate feedback
        const localMessage = {
            id: `local-${Date.now()}-${Math.random()}`,
            sender: patient.id,
            receiver: doctorId as string,
            message: newMessage,
            timestamp: new Date(),
            isSending: true // Add a flag to indicate it's being sent
        };

        setMessages(prev => [...prev, localMessage]);

        // Send the message through socket
        sendMessage(doctorId as string, newMessage);

        // Clear the input
        setNewMessage('');

        // Scroll to bottom
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const formatMessageTime = (date: Date) => {
        return format(new Date(date), 'h:mm a');
    };

    // Fix the isSender function to correctly identify messages sent by the patient
    const isSender = (msgSender: string) => {
        // Check if the message sender is the current patient
        const isCurrentUser = msgSender === patient?.id;
        return isCurrentUser;
    };

    // Create a skeleton loading message component
    const MessageSkeleton = ({ isReceived }: { isReceived: boolean }) => (
        <View
            className={`flex mb-4 mt-2 ${!isReceived ? 'items-end' : 'items-start'}`}
        >
            <View
                className={`max-w-[70%] h-10 ${!isReceived
                    ? 'bg-blue-200 rounded-t-2xl rounded-bl-2xl'
                    : 'bg-gray-200 rounded-t-2xl rounded-br-2xl'
                    } px-4 py-3 animate-pulse`}
            />
            <View className="w-12 h-3 mt-1 bg-gray-200 rounded animate-pulse" />
        </View>
    );

    // Handle image selection
    const handlePickImage = async () => {
        if (isReadOnlyChat) {
            let message = "Chat is currently in read-only mode.";
            if (isCompleted) {
                message = "This appointment has been completed. You can only view past messages.";
            } else if (isPending) {
                message = "This appointment is pending approval. Chat will be available once approved.";
            } else if (isCancelled) {
                message = "This appointment has been cancelled. You can only view past messages.";
            }

            Alert.alert('Cannot Send Media', message);
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageAsset = result.assets[0];
                await uploadAndSendFile(
                    imageAsset.uri,
                    imageAsset.fileName || `image_${Date.now()}.jpg`,
                    imageAsset.mimeType || 'image/jpeg',
                    'image'
                );
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    // Handle document selection
    const handlePickDocument = async () => {
        if (isReadOnlyChat) {
            let message = "Chat is currently in read-only mode.";
            if (isCompleted) {
                message = "This appointment has been completed. You can only view past messages.";
            } else if (isPending) {
                message = "This appointment is pending approval. Chat will be available once approved.";
            } else if (isCancelled) {
                message = "This appointment has been cancelled. You can only view past messages.";
            }

            Alert.alert('Cannot Send Document', message);
            return;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const document = result.assets[0];
                await uploadAndSendFile(
                    document.uri,
                    document.name,
                    document.mimeType || 'application/pdf',
                    'pdf'
                );
            }
        } catch (error) {
            console.error('Document picker error:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    // Update file handling to use server-side naming convention
    const handleSendFile = async (fileUrl: string, fileType: string) => {
        if (!socket) return;

        // Remove the base URL if it's present to store relative path
        const relativeUrl = fileUrl.replace(`${process.env.EXPO_PUBLIC_AWS_S3_URL}/`, '');
        const message = fileType.includes('image') ? '📷 Image' : '📄 Document';

        sendMessage(
            doctorId as string,
            message,
            relativeUrl, // Send relative URL to server
            fileType
        );
    };

    // Upload and send file using signed URL
    const uploadAndSendFile = async (fileUri: string, fileName: string, fileType: string, messageType: 'image' | 'pdf') => {
        try {
            setIsUploading(true);
            const mimeType = getMimeType(fileType);

            // Get signed URL using the hook
            const { url, key } = await getSignedUrl({
                filename: fileName,
                filetype: fileType
            });

            const base64Data = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64
            });

            // Upload file to S3
            await axios({
                method: 'put',
                url,
                data: base64Data,
                headers: {
                    'Content-Type': mimeType
                }
            })

            // Construct the correct file URL that matches how ReportViewer expects it
            const fileUrl = `${process.env.EXPO_PUBLIC_AWS_S3_URL}/${key}`;

            // Send message with file
            await handleSendFile(fileUrl, fileType);

            setIsUploading(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            Alert.alert('Upload Failed', 'Failed to upload file. Please try again.');
            setIsUploading(false);
        }
    };

    // Helper function to determine file type
    const determineFileType = (fileType: string): 'image' | 'pdf' | undefined => {
        if (!fileType) return undefined;

        const lowerType = fileType.toLowerCase();
        if (lowerType.includes('image') || lowerType.includes('jpg') ||
            lowerType.includes('jpeg') || lowerType.includes('png')) {
            return 'image';
        } else if (lowerType.includes('pdf')) {
            return 'pdf';
        }
        return undefined;
    };

    const getMimeType = (fileType: string | undefined): string => {
        if (!fileType) return 'application/octet-stream';

        // If it's already a proper MIME type, return it
        if (fileType.includes('/')) {
            return fileType.toLowerCase();
        }

        const lowerType = fileType.toLowerCase();

        // Generate MIME type based on extension or type hint
        if (lowerType.includes('jpg') || lowerType.includes('jpeg')) {
            return 'image/jpeg';
        } else if (lowerType.includes('png')) {
            return 'image/png';
        } else if (lowerType.includes('gif')) {
            return 'image/gif';
        } else if (lowerType.includes('pdf')) {
            return 'application/pdf';
        } else if (lowerType.includes('image')) {
            return 'image/jpeg'; // Default image type
        }

        return 'application/octet-stream'; // Default binary type
    };

    // Extract filename from URL
    const extractFileName = (url: string | undefined): string => {
        if (!url) return 'Unknown File';

        try {
            // Get the last part of the URL after the last slash
            const parts = decodeURIComponent(url).split('/');
            const fileName = parts[parts.length - 1];

            // Remove query parameters if present
            return fileName.split('?')[0];
        } catch (e) {
            return 'File';
        }
    };

    // Ensure URL is complete
    const getFullUrl = (url: string | undefined): string => {
        if (!url) return '';

        // If it already has the protocol, return as is
        if (url.startsWith('http')) return url;

        // Make sure there's a single slash between base URL and the path
        if (url.startsWith('/')) {
            return `${process.env.EXPO_PUBLIC_AWS_S3_URL}${url}`;
        } else {
            return `${process.env.EXPO_PUBLIC_AWS_S3_URL}/${url}`;
        }
    };

    // Update the message rendering to display images and documents
    const renderMessageContent = (msg: Message) => {
        const fileType = msg.fileType || (msg.file_type ? determineFileType(msg.file_type) : undefined);
        const fileUrl = msg.fileUrl || msg.file_url;

        if (!fileUrl) {
            return (
                <Text className={`${isSender(msg.sender || msg.sender_id || '') ? 'text-white' : 'text-black'} font-Jakarta`}>
                    {msg.message || msg.content}
                </Text>
            );
        }

        // Get full URL using the same approach as ReportViewer
        const fullUrl = getFullUrl(fileUrl);
        console.log('Rendering media with URL:', fullUrl); // Debug URL construction
        const fileName = msg.fileName || extractFileName(fileUrl);

        if (fileType === 'image') {
            return (
                <TouchableOpacity
                    onPress={() => {
                        setViewerContent({
                            fileUrl: fullUrl,
                            fileType: 'image/jpeg',
                            title: fileName
                        });
                        setViewerVisible(true);
                    }}
                >
                    <Image
                        source={{ uri: fullUrl }}
                        className="w-[180px] h-[180px] rounded-lg"
                        resizeMode="cover"
                        onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                    />
                    <Text
                        className={`text-xs ${isSender(msg.sender || msg.sender_id || '') ? 'text-white' : 'text-black'} mt-1`}
                        numberOfLines={1}
                    >
                        {fileName}
                    </Text>
                </TouchableOpacity>
            );
        } else if (fileType === 'pdf') {
            return (
                <TouchableOpacity
                    className="flex-row items-center p-2"
                    onPress={() => {
                        setViewerContent({
                            fileUrl: fullUrl,
                            fileType: 'application/pdf',
                            title: fileName
                        });
                        setViewerVisible(true);
                    }}
                >
                    <Ionicons
                        name="document-text"
                        size={24}
                        color={isSender(msg.sender || msg.sender_id || '') ? "#ffffff" : "#f40f02"}
                    />
                    <Text
                        className={`ml-2 ${isSender(msg.sender || msg.sender_id || '') ? 'text-white' : 'text-blue-700'}`}
                        numberOfLines={1}
                    >
                        {fileName}
                    </Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <Text className={`${isSender(msg.sender || msg.sender_id || '') ? 'text-white' : 'text-black'} font-Jakarta`}>
                    {msg.message || msg.content}
                </Text>
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                {doctor ? (
                    <TouchableOpacity className="flex-row items-center ml-4" onPress={() => router.push({ pathname: '/(root)/doctor-profile', params: { id: doctor.id } })}>
                        <>
                            <View className="relative">
                                <Image
                                    source={{ uri: doctor.profile_picture }}
                                    className="w-12 h-12 rounded-full"
                                />
                                {onlineUsers.has(doctor.id) ? (
                                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                                ) : <View className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />}
                            </View>
                            <View className="ml-3">
                                <Text className="font-JakartaBold text-lg">{doctor.name}</Text>
                                <Text className="font-Jakarta text-xs text-gray-500">{doctor.specialty}</Text>
                            </View>
                        </>
                    </TouchableOpacity>
                ) : (
                    // Doctor info loading skeleton
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full ml-4 bg-gray-200 animate-pulse" />
                        <View className="ml-3">
                            <View className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1" />
                            <View className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
                        </View>
                    </View>
                )}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-4"
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {shouldShowLoadingSkeletons() ? (
                        // Show skeleton loading messages only on initial load with no cached data
                        <>
                            {skeletonMessages.map((msg, index) => (
                                <MessageSkeleton key={`skeleton-${index}`} isReceived={msg.isReceived} />
                            ))}
                        </>
                    ) : messages.length === 0 ? (
                        <View className="py-8 items-center">
                            {isCompleted ? (
                                <Text className="text-amber-700 text-center">
                                    This appointment has been completed.
                                    {messages.length === 0 ? " No messages were exchanged." : ""}
                                </Text>
                            ) : isPending ? (
                                <Text className="text-blue-700 text-center">
                                    This appointment is pending approval.
                                    {messages.length === 0 ? " Chat will be available once approved." : ""}
                                </Text>
                            ) : isCancelled ? (
                                <Text className="text-red-700 text-center">
                                    This appointment has been cancelled.
                                    {messages.length === 0 ? " No messages were exchanged." : ""}
                                </Text>
                            ) : (
                                <Text className="text-gray-500">No messages yet. Say hello!</Text>
                            )}
                        </View>
                    ) : (
                        <>
                            {/* Debug message count */}
                            <Text className="text-xs text-gray-400 text-center my-2">
                                {messages.length} message(s) loaded
                            </Text>

                            {/* Render messages with fixed sender identification */}
                            {messages.map((msg, index) => {
                                // Determine if this message was sent by the current user (patient)
                                const senderIsCurrentUser = isSender(msg.sender || '');

                                return (
                                    <View
                                        key={msg.id || `msg-${index}-${Date.now()}`}
                                        className={`flex mb-4 mt-2 ${senderIsCurrentUser ? 'items-end' : 'items-start'}`}
                                    >
                                        <View
                                            className={`max-w-[80%] ${senderIsCurrentUser
                                                ? 'bg-blue-500 rounded-t-2xl rounded-bl-2xl'
                                                : 'bg-gray-100 rounded-t-2xl rounded-br-2xl'
                                                } px-4 py-3`}
                                        >
                                            {/* Message content with proper styling based on sender */}
                                            {renderMessageContent(msg)}
                                        </View>
                                        <Text className="text-xs text-gray-500 mt-1">
                                            {formatMessageTime(msg.timestamp || new Date())}
                                        </Text>
                                    </View>
                                );
                            })}
                        </>
                    )}
                </ScrollView>

                {/* Show appropriate status notice */}
                {isReadOnlyChat && (
                    <View className={`p-3 ${getStatusBannerStyle().bg} border-t ${getStatusBannerStyle().border}`}>
                        <Text className={`text-center font-JakartaSemiBold ${getStatusBannerStyle().text}`}>
                            {getStatusMessage()}
                        </Text>
                    </View>
                )}

                {/* Chat input field with attachment options */}
                {!isReadOnlyChat ? (
                    <View className="p-4 border-t border-gray-100 bg-white">
                        {isUploading && (
                            <View className="mb-2 p-2 bg-blue-50 rounded-lg flex-row items-center justify-center">
                                <ActivityIndicator size="small" color="#0066CC" />
                                <Text className="ml-2 text-blue-700 text-sm">Uploading file...</Text>
                            </View>
                        )}

                        <View className="flex-row items-center">
                            <View className="flex-row">
                                <TouchableOpacity
                                    onPress={handlePickImage}
                                    disabled={shouldShowLoadingSkeletons() || isUploading}
                                    className={`p-2 ${(shouldShowLoadingSkeletons() || isUploading) ? 'opacity-50' : ''}`}
                                >
                                    <Ionicons name="image" size={24} color="#0066CC" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handlePickDocument}
                                    disabled={shouldShowLoadingSkeletons() || isUploading}
                                    className={`p-2 ${(shouldShowLoadingSkeletons() || isUploading) ? 'opacity-50' : ''}`}
                                >
                                    <Ionicons name="document" size={24} color="#0066CC" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-1 flex-row items-center bg-gray-50 rounded-full px-4 py-2 ml-2">
                                <TextInput
                                    className="flex-1 font-Jakarta"
                                    value={newMessage}
                                    onChangeText={setNewMessage}
                                    placeholder={shouldShowLoadingSkeletons() ? "Loading chat history..." : "Type your message..."}
                                    multiline
                                    editable={!shouldShowLoadingSkeletons() && !isUploading}
                                />
                                <TouchableOpacity
                                    onPress={handleSend}
                                    disabled={!newMessage.trim() || shouldShowLoadingSkeletons() || isUploading}
                                    className={`ml-2 ${(!newMessage.trim() || shouldShowLoadingSkeletons() || isUploading) ? 'opacity-50' : ''}`}
                                >
                                    <Ionicons name="send" size={24} color="#3b82f6" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    // For read-only chats (Pending, Completed, Cancelled), show a read-only notice
                    <View className={`p-4 border-t ${getStatusBannerStyle().border} ${getStatusBannerStyle().bg}`}>
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="lock-closed" size={18} color={isCompleted ? "#92400e" : isPending ? "#1e40af" : "#b91c1c"} />
                            <Text className={`ml-2 ${getStatusBannerStyle().text} font-JakartaSemiBold`}>
                                This conversation is now in read-only mode
                            </Text>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
            {viewerContent && (

                <ReportViewer
                    visible={!!viewerContent}
                    onClose={() => { setViewerVisible(false); setViewerContent(null); }}
                    fileUrl={viewerContent.fileUrl}
                    fileType={viewerContent.fileType}
                    title={viewerContent.title}
                />
                // <ReportViewer
                //     visible={viewerVisible}
                //     onClose={() => {
                //         setViewerVisible(false);
                //         setViewerContent(null);
                //     }}
                //     fileUrl={viewerContent.fileUrl}
                //     fileType={viewerContent.fileType}
                //     title={viewerContent.title}
                // />
            )}
        </SafeAreaView>
    );
};

export default ChatRoom;
