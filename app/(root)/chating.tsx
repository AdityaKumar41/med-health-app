import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useNavigation } from "expo-router";

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'doctor';
    time: string;
    image?: string;
}

const Chating = () => {


    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);


    const [message, setMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Dummy data - replace with real data later
    const doctor = {
        name: "Dr. Sarah Wilson",
        specialization: "Cardiologist",
        avatar: "https://api.dicebear.com/9.x/dylan/jpeg?seed=Doctor",
        status: "Online",
    };

    const messages: Message[] = [
        { id: 1, text: "Hello, how can I help you today?", sender: "doctor", time: "09:41" },
        { id: 2, text: "I've been experiencing chest pain lately", sender: "user", time: "09:42" },
        { id: 3, text: "How long have you been experiencing this?", sender: "doctor", time: "09:43" },
        {
            id: 4,
            text: "Here's my ECG report",
            sender: "user",
            time: "09:44",
            image: "https://example.com/sample-ecg.jpg"
        },
    ];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const sendMessage = () => {
        if (message.trim().length > 0 || selectedImage) {
            // Add message sending logic here
            // You would typically upload the image to your server here

            // Reset states after sending
            setMessage("");
            setSelectedImage(null);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
                <View className="flex-row items-center space-x-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#4B5563" />
                    </TouchableOpacity>
                    <View className="relative">
                        <Image
                            source={{ uri: doctor.avatar }}
                            className="w-10 h-10 rounded-full"
                        />
                        <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-JakartaBold text-base text-gray-900">{doctor.name}</Text>
                        <Text className="font-JakartaMedium text-xs text-gray-500">{doctor.specialization}</Text>
                    </View>
                    <TouchableOpacity className="p-2 bg-blue-50 rounded-full">
                        <Ionicons name="call" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chat Messages */}
            <ScrollView
                ref={scrollViewRef}
                className="flex-1 px-4 pt-4"
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        className={`mb-4 max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
                    >
                        <View
                            className={`p-3 ${msg.sender === 'user'
                                ? 'bg-blue-500 rounded-t-2xl rounded-l-2xl'
                                : 'bg-gray-100 rounded-t-2xl rounded-r-2xl'
                                }`}
                        >
                            {msg.image && (
                                <Image
                                    source={{ uri: msg.image }}
                                    className="w-[200] h-[150] rounded-lg mb-2"
                                    resizeMode="cover"
                                />
                            )}
                            <Text
                                className={`font-Jakarta text-[15px] ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'
                                    }`}
                            >
                                {msg.text}
                            </Text>
                        </View>
                        <Text
                            className={`text-[11px] mt-1 text-gray-500 ${msg.sender === 'user' ? 'text-right' : 'text-left'
                                }`}
                        >
                            {msg.time}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            {/* Selected Image Preview */}
            {selectedImage && (
                <View className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                    <View className="relative w-20">
                        <Image
                            source={{ uri: selectedImage }}
                            className="w-20 h-20 rounded-lg"
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            onPress={removeSelectedImage}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                        >
                            <Ionicons name="close" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Message Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View className="border-t border-gray-200 bg-white px-4 py-2">
                    <View className="flex-row items-end space-x-2">
                        <TouchableOpacity
                            className="p-2 bg-gray-50 rounded-full"
                            onPress={pickImage}
                        >
                            <Ionicons name="image" size={24} color="#4B5563" />
                        </TouchableOpacity>
                        <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-2">
                            <TextInput
                                className="font-Jakarta text-base max-h-24"
                                placeholder="Type a message..."
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                style={{ lineHeight: 20 }}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={sendMessage}
                            className={`p-2 rounded-full ${message.trim().length > 0 || selectedImage
                                ? 'bg-blue-500'
                                : 'bg-gray-200'
                                }`}
                            disabled={!message.trim().length && !selectedImage}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={message.trim().length > 0 || selectedImage ? "white" : "#9CA3AF"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Chating;
