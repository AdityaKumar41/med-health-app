import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface AppointmentCardProps {
    name: string;
    specialty: string;
    date: string;
    image: string;
    onPress: () => void;
    ticket?: {
        expires_at: string;
        status: string;
        ticket_number: string;
    };
}

const calculateProgress = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const progress = endDate.getTime() - now.getTime();
    return Math.max(0, Math.min(1, progress / total));
};

const getDaysRemaining = (expiryDate: Date) => {
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const AppointmentCard = ({ name, specialty, date, image, onPress, ticket }: AppointmentCardProps) => {
    if (!ticket || new Date() > new Date(ticket.expires_at)) return null;

    const progress = calculateProgress(new Date(date), new Date(ticket.expires_at));
    const daysRemaining = getDaysRemaining(new Date(ticket.expires_at));

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return ['bg-blue-700', 'bg-blue-50', 'text-blue-700'];
            case 'pending': return ['bg-amber-500', 'bg-amber-50', 'text-amber-700'];
            default: return ['bg-gray-500', 'bg-gray-50', 'text-gray-700'];
        }
    };

    const [statusBg, statusLightBg, statusText] = getStatusColor(ticket.status);

    return (
        <TouchableOpacity
            onPress={onPress}
            className="mx-4 mb-4 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
        >
            {/* Top Color Bar */}
            <View className={`h-1 ${statusBg}`} />

            <View className="p-4">
                {/* Status Badge & Ticket Number */}
                <View className="flex-row justify-between items-center mb-4">
                    <View className={`px-3 py-1 rounded-full ${statusLightBg}`}>
                        <Text className={`text-xs font-JakartaBold ${statusText}`}>
                            {ticket.status.toUpperCase()}
                        </Text>
                    </View>
                    <Text className="font-JakartaMedium text-xs text-gray-500">
                        #{ticket.ticket_number}
                    </Text>
                </View>

                {/* Doctor Info */}
                <View className="flex-row items-center">
                    <Image
                        source={{ uri: image }}
                        className="w-16 h-16 rounded-xl"
                    />
                    <View className="ml-3 flex-1">
                        <Text className="font-JakartaBold text-base text-gray-900">{name}</Text>
                        <Text className="text-gray-600 text-sm font-JakartaMedium mt-0.5">{specialty}</Text>
                        <View className="flex-row items-center mt-1.5">
                            <Ionicons name="time-outline" size={14} color="#1D4ED8" />
                            <Text className="text-blue-700 text-xs ml-1 font-JakartaMedium">
                                {new Date(date).toLocaleString([], {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Progress Section */}
                <View className="mt-4 bg-blue-50 p-3 rounded-xl">
                    <View className="flex-row justify-between items-center mb-2">
                        <View className="flex-row items-center">
                            <Ionicons name="timer-outline" size={16} color="#1D4ED8" />
                            <Text className="ml-1.5 text-xs font-JakartaBold text-blue-700">
                                Time Remaining
                            </Text>
                        </View>
                        <Text className="text-xs font-JakartaBold text-blue-700">
                            {daysRemaining} days left
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-white rounded-full overflow-hidden">
                        <View
                            className={`h-full ${progress < 0.3 ? 'bg-red-500' : 'bg-blue-700'}`}
                            style={{ width: `${progress * 100}%` }}
                        />
                    </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    className="mt-4 flex-row items-center justify-center bg-blue-700 py-2.5 rounded-xl"
                    onPress={onPress}
                >
                    <Ionicons name="qr-code-outline" size={16} color="#fff" />
                    <Text className="ml-2 text-sm text-white font-JakartaBold">
                        View Ticket
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default AppointmentCard;