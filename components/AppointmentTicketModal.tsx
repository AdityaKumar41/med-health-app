import { View, Text, Modal, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type AppointmentTicketModalProps = {
    visible: boolean;
    onClose: () => void;
    appointment: any;
};

const AppointmentTicketModal = ({ visible, onClose, appointment }: AppointmentTicketModalProps) => {
    if (!appointment) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white w-[90%] rounded-3xl p-6">
                    {/* Header with close button */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="font-JakartaBold text-xl text-gray-900">Appointment Ticket</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={24} color="#1D4ED8" />
                        </TouchableOpacity>
                    </View>

                    {/* Ticket content */}
                    <View className="bg-blue-50 rounded-xl p-4 mb-4">
                        <View className="items-center mb-4">
                            <Image
                                source={{ uri: appointment.ticket.qr_code }}
                                className="w-48 h-48"
                            />
                            <Text className="font-JakartaBold mt-2 text-lg text-blue-700">{appointment.ticket.ticket_number}</Text>
                        </View>

                        <View className="border-t border-dashed border-blue-200 my-4" />

                        {/* Doctor Info */}
                        <View className="flex-row items-center mb-4 bg-white p-3 rounded-xl">
                            <Image
                                source={{ uri: appointment.doctor.profile_picture }}
                                className="w-16 h-16 rounded-xl"
                            />
                            <View className="ml-4">
                                <Text className="font-JakartaBold text-lg text-gray-900">{appointment.doctor.name}</Text>
                                <Text className="text-blue-700 font-JakartaMedium">{appointment.doctor.hospital}</Text>
                                <Text className="text-gray-600">{appointment.doctor.qualification}</Text>
                            </View>
                        </View>

                        {/* Appointment Details */}
                        <View className="bg-white p-4 rounded-xl space-y-2">
                            <DetailRow label="Date" value={new Date(appointment.date).toLocaleDateString()} />
                            <DetailRow label="Time" value={new Date(appointment.date).toLocaleTimeString()} />
                            <DetailRow label="Status" value={appointment.status.toUpperCase()} />
                            <DetailRow label="Fee Paid" value={`POL ${appointment.amount_paid}`} />
                            <DetailRow label="Expires" value={new Date(appointment.ticket.expires_at).toLocaleDateString()} />
                        </View>

                        <View className="border-t border-dashed border-blue-200 my-4" />

                        {/* Notes */}
                        <Text className="text-blue-700 text-sm font-JakartaMedium">{appointment.ticket.notes}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex-row justify-between">
        <Text className="text-gray-600 font-JakartaMedium">{label}:</Text>
        <Text className="font-JakartaBold text-blue-700">{value}</Text>
    </View>
);

export default AppointmentTicketModal;
