import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface OfflinePageProps {
    onRetry: () => void;
}

export const OfflinePage = ({ onRetry }: OfflinePageProps) => {
    return (
        <View style={styles.container}>
            <MaterialIcons name="wifi-off" size={64} color="#666" />
            <Text style={styles.title}>No Internet Connection</Text>
            <Text style={styles.message}>
                Please check your internet connection and try again
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 16,
        marginBottom: 8,
        fontFamily: "Jakarta-Bold",
    },
    message: {
        fontSize: 16,
        textAlign: "center",
        color: "#666",
        marginBottom: 24,
        fontFamily: "Jakarta-Regular",
    },
    retryButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Jakarta-Medium",
    },
});
