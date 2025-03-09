import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Share, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAccount } from 'wagmi';
import { usePatient } from '@/hooks/usePatient';
import { useTicketData } from '@/hooks/useTicket';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { format, parseISO } from 'date-fns';
import { useNavigation } from 'expo-router';

// Define interfaces based on the API response
interface Doctor {
    id: string;
    name: string;
    profile_picture?: string;
    hospital?: string;
    consultancy_fees?: number;
}

interface Patient {
    id: string;
    name: string;
    profile_picture?: string;
}

interface Appointment {
    id: string;
    date: string;
    appointment_fee: number;
    doctor: Doctor;
    patient: Patient;
}

interface Ticket {
    id: string;
    ticket_number: string;
    appointment_id: string;
    status: string;
    notes: string;
    qr_code: string;
    expires_at: string;
    createdAt: string;
    updatedAt: string;
    appointment: Appointment;
}

const TicketScreen = () => {

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerShown: false
        });
    }, [navigation])

    const { address } = useAccount();
    const { data: patientData } = usePatient(address!);
    const { data: ticketData, isLoading, error, refetch } = useTicketData(address!, patientData?.id);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [downloading, setDownloading] = useState(false);
    const viewShotRef = React.useRef<ViewShot | null>(null);
    const [hasAttemptedRefetch, setHasAttemptedRefetch] = useState(false);

    // Attempt to refetch data once if no tickets are found
    useEffect(() => {
        if (!isLoading && ticketData?.data?.length === 0 && !hasAttemptedRefetch) {
            // Try refetching once to ensure we have the latest data
            refetch();
            setHasAttemptedRefetch(true);
        }
    }, [isLoading, ticketData, refetch, hasAttemptedRefetch]);

    // Loading state
    if (isLoading || !patientData) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text className="mt-4 text-gray-600 font-Jakarta">Loading tickets...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state - with retry option
    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center p-4 border-b border-gray-200">
                    <TouchableOpacity onPress={() => router.back()} className='p-4'>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="ml-4 text-xl font-JakartaBold">My Tickets</Text>
                </View>

                <View className="flex-1 justify-center items-center p-4">
                    <Ionicons name="alert-circle-outline" size={60} color="#f87171" />
                    <Text className="mt-4 text-lg text-gray-800 font-JakartaBold">Error Loading Tickets</Text>
                    <Text className="mt-2 text-gray-600 text-center font-Jakarta">{error.message}</Text>

                    <View className="flex-row mt-6 space-x-3">
                        <TouchableOpacity
                            className="bg-blue-500 py-3 px-6 rounded-lg"
                            onPress={() => refetch()}>
                            <Text className="text-white font-JakartaBold">Retry</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-gray-200 py-3 px-6 rounded-lg"
                            onPress={() => router.back()}>
                            <Text className="text-gray-700 font-JakartaBold">Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Extract tickets from the response or use empty array if undefined
    const tickets: Ticket[] = ticketData?.data || [];
    console.log("ticketdata", ticketData)

    const handleDownload = async (ticket: Ticket) => {
        try {
            // Request permissions
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('We need media library permissions to save the ticket');
                return;
            }

            setDownloading(true);
            setSelectedTicket(ticket);

            // Capture the ticket view as an image
            const captureMethod = viewShotRef.current?.capture;
            if (!captureMethod) {
                throw new Error('ViewShot ref or capture method is not available');
            }
            const uri = await captureMethod();

            // Save to media library
            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('Tickets', asset, false);

            alert('Ticket saved to your gallery');
            setDownloading(false);
        } catch (error) {
            console.error('Error downloading ticket:', error);
            alert('Failed to download ticket');
            setDownloading(false);
        }
    };

    const handleShare = async (ticket: Ticket) => {
        try {
            setDownloading(true);
            setSelectedTicket(ticket);

            // Capture the ticket view as an image
            const captureMethod = viewShotRef.current?.capture;
            if (!captureMethod) {
                throw new Error('ViewShot ref or capture method is not available');
            }
            const uri = await captureMethod();

            // Share the image
            if (!(await Sharing.isAvailableAsync())) {
                alert('Sharing is not available on this device');
                setDownloading(false);
                return;
            }

            await Sharing.shareAsync(uri);
            setDownloading(false);
        } catch (error) {
            console.error('Error sharing ticket:', error);
            alert('Failed to share ticket');
            setDownloading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'PPP');
        } catch (error) {
            return dateString;
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'p');
        } catch (error) {
            return dateString;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-JakartaBold">My Tickets</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {tickets.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Ionicons name="ticket-outline" size={80} color="#d1d5db" />
                        <Text className="mt-4 text-lg text-gray-500 font-JakartaBold">No Tickets Found</Text>
                        <Text className="mt-2 text-gray-400 text-center font-Jakarta px-6">
                            You don't have any active appointment tickets yet. Book an appointment to get your ticket, or check back later if you've recently booked.
                        </Text>

                        <View className="flex-row mt-6 space-x-3">
                            <TouchableOpacity
                                className="bg-blue-500 py-3 px-6 rounded-lg"
                                onPress={() => router.push('/(root)/service')}>
                                <Text className="text-white font-JakartaBold">Book Appointment</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-gray-200 py-3 px-6 rounded-lg"
                                onPress={() => refetch()}>
                                <Text className="text-gray-700 font-JakartaBold">Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Render each ticket - existing code
                    tickets.map((ticket) => (
                        <View key={ticket.id || `ticket-${Math.random()}`} className="mb-6 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                            {/* Check if appointment data exists */}
                            {ticket.appointment ? (
                                <>
                                    <View className="p-4 bg-blue-500">
                                        <Text className="text-white font-JakartaBold text-lg">Appointment Ticket</Text>
                                        <Text className="text-white/80 font-Jakarta">Ref: {ticket.ticket_number || 'N/A'}</Text>
                                    </View>

                                    <View className="p-4">
                                        {/* Display appointment details */}
                                        <View className="flex-row justify-between mb-4">
                                            <View className="flex-1">
                                                <Text className="text-gray-600 font-Jakarta">Patient</Text>
                                                <Text className="font-JakartaBold text-gray-800">
                                                    {ticket.appointment?.patient?.name || patientData.name || 'N/A'}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-600 font-Jakarta">Doctor</Text>
                                                <Text className="font-JakartaBold text-gray-800">
                                                    {ticket.appointment?.doctor?.name || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* ...existing display code... */}

                                        <View className="flex-row justify-between mb-4">
                                            <View className="flex-1">
                                                <Text className="text-gray-600 font-Jakarta">Date</Text>
                                                <Text className="font-JakartaBold text-gray-800">
                                                    {ticket.appointment.date ? formatDate(ticket.appointment.date) : 'N/A'}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-600 font-Jakarta">Time</Text>
                                                <Text className="font-JakartaBold text-gray-800">
                                                    {ticket.appointment.date ? formatTime(ticket.appointment.date) : 'N/A'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* ...existing display code... */}
                                    </View>
                                </>
                            ) : (
                                // Display fallback for tickets without appointment data
                                <>
                                    <View className="p-4 bg-yellow-500">
                                        <Text className="text-white font-JakartaBold text-lg">Ticket Information</Text>
                                        <Text className="text-white/80 font-Jakarta">Ref: {ticket.ticket_number || 'N/A'}</Text>
                                    </View>

                                    <View className="p-5">
                                        <View className="bg-yellow-50 p-3 rounded-lg mb-3">
                                            <Text className="text-yellow-700 font-JakartaMedium text-center">
                                                Complete ticket information is not available
                                            </Text>
                                        </View>

                                        <View className="flex-row justify-between mb-4">
                                            <View className="flex-1">
                                                <Text className="text-gray-600 font-Jakarta">Ticket Status</Text>
                                                <View className="flex-row items-center mt-1">
                                                    <View
                                                        className={`w-3 h-3 rounded-full mr-2 ${ticket.status === 'active' ? 'bg-green-500' :
                                                            ticket.status === 'used' ? 'bg-blue-500' : 'bg-yellow-500'
                                                            }`}
                                                    />
                                                    <Text className="font-JakartaBold text-gray-800 capitalize">
                                                        {ticket.status || 'Unknown'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {ticket.expires_at && (
                                            <View className="mb-4">
                                                <Text className="text-gray-600 font-Jakarta">Expires</Text>
                                                <Text className="font-JakartaBold text-gray-800">
                                                    {formatDate(ticket.expires_at)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </>
                            )}

                            {/* QR code section - works for any ticket */}
                            <View className="p-4 border-t border-gray-100">
                                <View className="items-center mt-2 mb-4">
                                    {ticket.qr_code ? (
                                        <Image
                                            source={{ uri: ticket.qr_code }}
                                            className="w-[180px] h-[180px]"
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View className="w-[180px] h-[180px] bg-gray-100 items-center justify-center">
                                            <Ionicons name="qr-code" size={100} color="#d1d5db" />
                                            <Text className="text-gray-400 text-xs mt-2">QR Code not available</Text>
                                        </View>
                                    )}
                                    <Text className="mt-2 text-xs text-gray-500 font-Jakarta">
                                        Scan this code at the hospital reception
                                    </Text>
                                </View>

                                <View className="flex-row justify-around mt-4 border-t border-gray-200 pt-4">
                                    <TouchableOpacity
                                        className="flex-row items-center"
                                        onPress={() => handleDownload(ticket)}>
                                        <Ionicons name="download-outline" size={20} color="#0066cc" />
                                        <Text className="ml-2 text-blue-600 font-JakartaBold">Download</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-row items-center"
                                        onPress={() => handleShare(ticket)}>
                                        <Ionicons name="share-social-outline" size={20} color="#0066cc" />
                                        <Text className="ml-2 text-blue-600 font-JakartaBold">Share</Text>
                                    </TouchableOpacity>
                                </View>

                                {ticket.notes && (
                                    <View className="mt-4 bg-gray-50 p-3 rounded-lg">
                                        <Text className="text-xs text-gray-500 italic">
                                            {ticket.notes}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Hidden ViewShot component for capturing */}
            {selectedTicket && (
                <View className="absolute opacity-0">
                    <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
                        <View className="bg-white p-4 w-80">
                            <View className="p-4 bg-blue-500 rounded-t-xl">
                                <Text className="text-white font-bold text-lg">Appointment Ticket</Text>
                                <Text className="text-white/80">Ref: {selectedTicket.ticket_number || 'N/A'}</Text>
                            </View>

                            <View className="p-4 border-l border-r border-b border-gray-200 rounded-b-xl">
                                <View className="flex-row justify-between mb-4">
                                    <View className="flex-1">
                                        <Text className="text-gray-600">Patient</Text>
                                        <Text className="font-bold text-gray-800">
                                            {selectedTicket.appointment?.patient?.name || patientData.name}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-600">Doctor</Text>
                                        <Text className="font-bold text-gray-800">
                                            {selectedTicket.appointment?.doctor?.name || 'N/A'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between mb-4">
                                    <View className="flex-1">
                                        <Text className="text-gray-600">Date</Text>
                                        <Text className="font-bold text-gray-800">
                                            {formatDate(selectedTicket.appointment?.date)}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-600">Time</Text>
                                        <Text className="font-bold text-gray-800">
                                            {formatTime(selectedTicket.appointment?.date)}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between mb-4">
                                    <View className="flex-1">
                                        <Text className="text-gray-600">Ticket #</Text>
                                        <Text className="font-bold text-gray-800">
                                            {selectedTicket.ticket_number}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-600">Status</Text>
                                        <Text className="font-bold text-gray-800 capitalize">
                                            {selectedTicket.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className="items-center mt-2 mb-2">
                                    {selectedTicket.qr_code ? (
                                        <Image
                                            source={{ uri: selectedTicket.qr_code }}
                                            style={{ width: 180, height: 180 }}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View style={{ width: 180, height: 180, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                                            <Ionicons name="qr-code" size={100} color="#d1d5db" />
                                            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>QR Code not available</Text>
                                        </View>
                                    )}
                                    <Text className="mt-2 text-xs text-gray-500">
                                        Scan this code at the hospital reception
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ViewShot>
                </View>
            )}

            {downloading && (
                <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <View className="bg-white p-4 rounded-lg">
                        <ActivityIndicator size="large" color="#0066cc" />
                        <Text className="mt-2 text-center font-Jakarta">Processing...</Text>
                    </View>
                </View>
            )}

            <StatusBar style="dark" />
        </SafeAreaView>
    );
};

export default TicketScreen;
