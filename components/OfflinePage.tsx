import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface OfflinePageProps {
    onRetry: () => void;
}

export const OfflinePage = ({ onRetry }: OfflinePageProps) => {
    return (
        <View className="flex-1 justify-center items-center p-5 bg-white">
            <View className="bg-gray-50 p-8 rounded-2xl items-center shadow-sm">
                <View className="bg-gray-100 p-4 rounded-full mb-4">
                    <MaterialIcons name="wifi-off" size={48} color="#666" />
                </View>
                <Text className="text-xl font-jakarta-bold text-gray-800 mb-2">
                    No Internet Connection
                </Text>
                <Text className="text-base font-jakarta-regular text-gray-600 text-center mb-6">
                    Please check your internet connection and try again
                </Text>
                <TouchableOpacity
                    className="bg-primary px-6 py-3 rounded-xl active:opacity-80"
                    onPress={onRetry}
                >
                    <Text className="text-white font-jakarta-medium text-base">
                        Try Again
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
