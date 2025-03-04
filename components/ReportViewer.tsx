import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, Text, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';

interface ReportViewerProps {
    visible: boolean;
    onClose: () => void;
    fileUrl: string;
    fileType: string;
    title: string;
}

const ReportViewer = ({ visible, onClose, fileUrl, fileType, title }: ReportViewerProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isPDF = fileType.toLowerCase().includes('pdf');
    const isImage = fileType.toLowerCase().includes('image');

    // Ensure the URL is properly formed
    const fullUrl = fileUrl.startsWith('http')
        ? fileUrl
        : `${process.env.EXPO_PUBLIC_AWS_S3_URL}/${fileUrl}`;

    useEffect(() => {
        // Reset states when component becomes visible
        if (visible) {
            setIsLoading(true);
            setError(null);
            console.log('Loading document:', { fullUrl, fileType });
        }
    }, [visible, fullUrl]);

    const handleLoadEnd = () => {
        console.log('Document loaded successfully');
        setIsLoading(false);
    };

    const handleError = (e: any) => {
        console.error('Error loading document:', e);
        setIsLoading(false);
        setError(`Failed to load ${isPDF ? 'PDF' : 'image'}`);
        Alert.alert(
            'Error',
            `Failed to load ${isPDF ? 'PDF' : 'image'}. Please check your internet connection and try again.`
        );
    };

    const renderContent = () => {
        if (isPDF) {
            // Use Mozilla's PDF.js viewer for better compatibility
            const pdfViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fullUrl)}`;

            return (
                <View className="flex-1">
                    <WebView
                        source={{ uri: pdfViewerUrl }}
                        style={{ flex: 1 }}
                        onLoadEnd={handleLoadEnd}
                        onError={handleError}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        renderLoading={() => (
                            <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-white">
                                <ActivityIndicator size="large" color="#0066CC" />
                            </View>
                        )}
                    />
                </View>
            );
        } else if (isImage) {
            return (
                <View className="flex-1 bg-gray-100 justify-center items-center">
                    <Image
                        source={{ uri: fullUrl }}
                        className="w-full h-full"
                        resizeMode="contain"
                        onLoadEnd={handleLoadEnd}
                        onError={handleError}
                    />
                </View>
            );
        }

        return (
            <View className="flex-1 justify-center items-center">
                <Ionicons name="document-outline" size={64} color="#999" />
                <Text className="text-gray-500 font-JakartaMedium mt-4">
                    Unsupported file type
                </Text>
                <Text className="text-gray-400 font-Jakarta text-center mt-2 px-8">
                    This file format ({fileType}) cannot be displayed in the app.
                </Text>
            </View>
        );
    };

    const LoadingOverlay = () => (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-white/80">
            <ActivityIndicator size="large" color="#0066CC" />
            <Text className="mt-4 text-gray-600 font-JakartaMedium">Loading...</Text>
        </View>
    );

    const ErrorOverlay = () => (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-white/80">
            <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
            <Text className="mt-4 text-center text-red-500 font-JakartaBold">
                {error}
            </Text>
            <TouchableOpacity
                onPress={() => setIsLoading(true)}
                className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
            >
                <Text className="text-white font-JakartaMedium">Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="bg-blue-600 pt-4 pb-4 px-4 flex-row items-center">
                    <TouchableOpacity onPress={onClose} className="mr-4">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-JakartaBold flex-1" numberOfLines={1}>
                        {title}
                    </Text>
                    <TouchableOpacity
                        onPress={() => Alert.alert('Coming Soon', 'Sharing functionality will be available soon!')}
                        className="p-2"
                    >
                        <Ionicons name="share-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View className="flex-1">
                    {renderContent()}
                    {isLoading && <LoadingOverlay />}
                    {error && <ErrorOverlay />}
                </View>
            </View>
        </Modal>
    );
};

export default ReportViewer;
