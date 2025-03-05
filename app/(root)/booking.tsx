import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    StyleSheet,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { Button } from '@/components/ui/Button';
import { useDoctorbyId } from '@/hooks/useDoctor';
import { useAppointmentPost } from '@/hooks/useAppointment';
import { useAccount, useWriteContract } from 'wagmi';
import { usePatient } from '@/hooks/usePatient';
import { ethers } from 'ethers';
import { useContractWrite } from 'wagmi';
import ContractABI from "@/contract/Contract.json";

// Define types
interface TimeSlot {
    id: string;
    time: string;
    isAvailable: boolean;
    originalStartTime?: string; // Make this optional to avoid errors
    endTime?: string; // Make this optional to avoid errors
}

interface Receipt {
    doctorName: string;
    doctorSpecialty: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentFee: number; // Changed to number
    bookingId: string;
    ticketNumber?: string;
    qrCode?: string;
    // Add any additional fields from the API response
}

const BookingScreen = () => {
    const { address: walletAddress } = useAccount()
    const router = useRouter();
    const navigation = useNavigation();
    const { doctorId, doctorName, day } = useLocalSearchParams();
    const { data: patient } = usePatient(walletAddress!)
    const { writeContractAsync } = useWriteContract();

    // States
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [availableDates, setAvailableDates] = useState<Record<string, any>>({});
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);

    const { data, isLoading } = useDoctorbyId(Array.isArray(doctorId) ? doctorId[0] : doctorId || '');
    const doctor = data?.data;

    // Use the appointment mutation hook
    const { mutate: bookAppointment, isPending: isSubmitting, error: submissionError } = useAppointmentPost(walletAddress || '');

    // Hide default header
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Setup available dates based on doctor's available days - improved version
    useEffect(() => {
        if (doctor && doctor.available_days) {
            const today = new Date();
            const availableDatesMap: Record<string, any> = {};
            const unavailableDatesMap: Record<string, any> = {};

            // Loop for the next 3 months
            for (let i = 0; i < 90; i++) {
                const date = new Date();
                date.setDate(today.getDate() + i);

                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                const dateString = date.toISOString().split('T')[0];

                // Mark days as available or unavailable
                if (doctor.available_days.includes(dayOfWeek)) {
                    // Available day
                    availableDatesMap[dateString] = {
                        marked: true,
                        dotColor: '#0066CC',
                        selectedColor: '#0066CC',
                        selected: false,
                        disableTouchEvent: false
                    };
                } else {
                    // Unavailable day
                    unavailableDatesMap[dateString] = {
                        disabled: true,
                        disableTouchEvent: true,
                        textColor: '#d3d3d3'
                    };
                }
            }

            // Combine available and unavailable dates
            const allDatesMap = { ...unavailableDatesMap, ...availableDatesMap };
            setAvailableDates(allDatesMap);

            // Set first available date
            const firstAvailableDate = Object.keys(availableDatesMap)[0];
            if (firstAvailableDate) {
                handleDateSelect(firstAvailableDate);
            }
        }
    }, [doctor]);

    // Generate time slots based on doctor's available times - improved
    useEffect(() => {
        if (doctor && doctor.available_time) {
            const slots: TimeSlot[] = [];

            // Group time slots by morning, afternoon, evening
            const timeGroups: Record<string, TimeSlot[]> = {
                morning: [],
                afternoon: [],
                evening: []
            };

            doctor.available_time.forEach((timeSlot: any) => {
                const startTime = new Date(`2000-01-01T${timeSlot.start_time}`);
                const endTime = new Date(`2000-01-01T${timeSlot.end_time}`);

                // Create 30-min slots
                while (startTime < endTime) {
                    const hour = startTime.getHours();
                    const timeString = startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });

                    const slot = {
                        id: `${timeSlot.id}-${timeString}`,
                        time: timeString,
                        isAvailable: true
                    };

                    // Categorize by time of day
                    if (hour < 12) {
                        timeGroups.morning.push(slot);
                    } else if (hour < 17) {
                        timeGroups.afternoon.push(slot);
                    } else {
                        timeGroups.evening.push(slot);
                    }

                    slots.push(slot);
                    startTime.setMinutes(startTime.getMinutes() + 30);
                }
            });

            setTimeSlots(slots);
            setTimeGroups(timeGroups);

            // Display doctor's overall availability times
            const allStartTimes = doctor.available_time.map((t: any) => new Date(`2000-01-01T${t.start_time}`));
            const allEndTimes = doctor.available_time.map((t: any) => new Date(`2000-01-01T${t.end_time}`));

            if (allStartTimes.length && allEndTimes.length) {
                const earliestTime = new Date(Math.min(...allStartTimes.map((t: { getTime: () => any; }) => t.getTime())));
                const latestTime = new Date(Math.max(...allEndTimes.map((t: { getTime: () => any; }) => t.getTime())));

                setDoctorAvailabilityRange({
                    start: earliestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                    end: latestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                });
            }
        }
    }, [doctor]);

    // New state variables
    const [timeGroups, setTimeGroups] = useState<Record<string, TimeSlot[]>>({
        morning: [],
        afternoon: [],
        evening: []
    });
    const [doctorAvailabilityRange, setDoctorAvailabilityRange] = useState<{ start: string, end: string } | null>(null);
    // Remove timeFilter state since we don't need tabs anymore
    // const [timeFilter, setTimeFilter] = useState<string>('all');


    // Handle date selection - updated for clarity
    const handleDateSelect = (date: string) => {
        // Only proceed if it's an available date
        if (!availableDates[date] || availableDates[date].disabled) {
            return;
        }

        setSelectedDate(date);

        const dateObj = new Date(date);
        setSelectedMonth(dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

        // Update the calendar marked dates to show selection
        const updatedAvailableDates = { ...availableDates };

        // Reset all selections first
        Object.keys(updatedAvailableDates).forEach(key => {
            if (updatedAvailableDates[key] && !updatedAvailableDates[key].disabled) {
                updatedAvailableDates[key] = {
                    ...updatedAvailableDates[key],
                    selected: false
                };
            }
        });

        // Set the new selection
        if (updatedAvailableDates[date] && !updatedAvailableDates[date].disabled) {
            updatedAvailableDates[date] = {
                ...updatedAvailableDates[date],
                selected: true
            };
        }

        setAvailableDates(updatedAvailableDates);
        setCalendarVisible(false);
    };

    // Calculate consultation fee
    const calculateConsultationFee = () => {
        if (doctor && doctor.consultancy_fees) {
            return `POL ${doctor.consultancy_fees}`;
        }
        return 'FREE';
    };

    // Handle booking confirmation
    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedTimeSlot || !doctor) {
            Alert.alert('Booking Error', 'Please select both date and time for your appointment');
            return;
        }

        // Check if patient data is loaded and has an ID
        if (!patient) {
            Alert.alert('Booking Error', 'Patient information is not loaded yet. Please wait a moment and try again.');
            return;
        }

        if (!patient.id) {
            Alert.alert('Booking Error', 'Your patient profile is incomplete. Please update your profile first.');
            return;
        }

        setIsBookingLoading(true);

        try {
            // Format the date and time as required by the API
            const appointmentDateTime = combineDateTime(selectedDate, selectedTimeSlot);

            // Calculate fees from doctor's experience - now as numbers
            const fee = doctor.consultancy_fees || 800;

            // Prepare blockchain transaction on Polygon
            const hash = await writeContractAsync({
                address: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
                abi: ContractABI,
                functionName: 'bookAppointment',
                args: [doctor.wallet_address],
                value: BigInt(ethers.utils.parseUnits(fee.toString(), 'ether').toString())
            });

            // Wait for transaction confirmation
            // For Polygon, you might need to adjust confirmation wait times
            console.log('Transaction hash:', hash);

            // Add a debug log to check what's available in patient data
            console.log("Patient data before booking:", patient);

            // Prepare the booking data according to the Zod schema
            const bookingData = {
                patient_id: patient.id, // Ensure patient.id is available
                doctor_id: doctor.id,
                date: appointmentDateTime,
                appointment_fee: fee, // Send as number
                amount_paid: fee, // Send as number
                ticket_notes: `Appointment booked via mobile app for ${doctor.name}`,
                tx_hash: hash // Store the transaction hash
            };

            // Log the data we're about to send
            console.log("Booking data being sent:", bookingData);

            // Call the mutation function to make the API request
            bookAppointment(bookingData, {
                onSuccess: (response: any) => {
                    console.log("Booking success response:", response);
                    setIsBookingLoading(false);

                    // Make sure response contains the needed data
                    if (!response.appointment) {
                        Alert.alert(
                            'Booking Incomplete',
                            'Your payment was processed but we couldn\'t confirm your appointment details. Please contact support.'
                        );
                        return;
                    }

                    // Create receipt data with fallbacks for missing fields
                    setReceipt({
                        doctorName: doctor.name,
                        doctorSpecialty: doctor.specialties ? doctor.specialties.map((specialty: any) => specialty.name).join(', ') : 'General Physician',
                        appointmentDate: new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        }),
                        appointmentTime: selectedTimeSlot,
                        appointmentFee: fee, // Store as number
                        bookingId: response.appointment?.id || 'Pending',
                        ticketNumber: response.ticket?.ticket_number || 'Pending',
                        qrCode: response.ticket?.qr_code
                    });

                    setShowReceipt(true);
                },
                onError: (error: any) => {
                    setIsBookingLoading(false);
                    console.error("Booking error:", error);
                    Alert.alert(
                        'Booking Failed',
                        `Unable to book appointment: ${error?.message || 'Please try again later'}`
                    );
                }
            });
        } catch (error: any) {
            setIsBookingLoading(false);
            console.error("Confirmation error:", error);
            Alert.alert('Booking Error', error?.message || 'An unexpected error occurred');
        }
    };

    // Helper function to combine date and time into required format
    const combineDateTime = (dateStr: string, timeStr: string): string => {
        try {
            // Parse the timeStr (e.g., "9:30 AM") into hours and minutes
            const timeParts = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/i);
            if (!timeParts) {
                throw new Error('Invalid time format');
            }

            let hours = parseInt(timeParts[1], 10);
            const minutes = parseInt(timeParts[2], 10);
            const period = timeParts[3].toUpperCase();

            // Convert hours to 24-hour format
            if (period === 'PM' && hours < 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            // Create a date object with the combined date and time
            const dateObj = new Date(dateStr);
            dateObj.setHours(hours, minutes, 0, 0);

            // Format the date as ISO string and return
            return dateObj.toISOString();
        } catch (e) {
            console.error('Error combining date and time:', e);
            // Fallback: return the date string only (API might handle it)
            return dateStr;
        }
    };

    // Handle final booking completion - Fixed navigation approach
    const handleCompleteBooking = () => {
        setShowReceipt(false);
        setBookingComplete(true);

        router.replace('/(root)/(tabs)');

        // Use router instead of navigation for redirecting
        // This fixes the navigation context error
        // setTimeout(() => {
        //     try {
        //         // Use the correct path for navigation based on your app structure

        //     } catch (error) {
        //         console.error("Navigation error:", error);
        //         // Fallback navigation in case of error
        //         router.replace('/');
        //     }
        // }, 3000);
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#0066CC" />
                <Text className="mt-3 text-gray-600">Loading booking details...</Text>
            </SafeAreaView>
        );
    }

    if (bookingComplete) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-5">
                <View className="bg-white p-6 rounded-2xl w-full shadow-sm items-center">
                    <View className="w-20 h-20 bg-green-100 rounded-full mb-4 justify-center items-center">
                        <Ionicons name="checkmark" size={40} color="#22C55E" />
                    </View>
                    <Text className="text-2xl font-JakartaBold text-center">Booking Successful!</Text>
                    <Text className="text-gray-600 text-center mt-2 mb-4">
                        Your appointment has been booked successfully.
                        You will receive a confirmation email shortly.
                    </Text>
                    <Text className="text-blue-600 font-JakartaSemiBold mb-6">
                        Booking ID: {receipt?.bookingId}
                    </Text>
                    <Text className="text-gray-500">Redirecting to home...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Safe state setter with error handling
    const safeSetTimeFilter = (filter: string) => {
        try {
            // Make sure the component is still mounted before updating state
            setTimeout(() => {
                safeSetTimeFilter(filter);
            }, 0);
        } catch (error) {
            console.error("Error setting time filter:", error);
        }
    };

    // Generate time slots based on doctor's available times - improved with better start time handling
    useEffect(() => {
        if (doctor && doctor.available_time && doctor.available_time.length > 0) {
            const slots: TimeSlot[] = [];

            // Initialize time groups
            const newTimeGroups: Record<string, TimeSlot[]> = {
                morning: [],
                afternoon: [],
                evening: []
            };

            // Extract time directly from doctor's available times
            doctor.available_time.forEach((timeSlot: any) => {
                try {
                    // Use the exact start and end times from doctor's schedule
                    const startTime = new Date(`2000-01-01T${timeSlot.start_time}`);
                    const endTime = new Date(`2000-01-01T${timeSlot.end_time}`);

                    // Create slots at 30-minute intervals
                    let currentTime = new Date(startTime);
                    while (currentTime < endTime) {
                        const timeString = currentTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        });

                        const hour = currentTime.getHours();

                        const slot = {
                            id: `${timeSlot.id}-${timeString}`,
                            time: timeString,
                            isAvailable: true,
                            originalStartTime: timeSlot.start_time // Store original time for reference
                        };

                        // Categorize time slot
                        if (hour < 12) {
                            newTimeGroups.morning.push(slot);
                        } else if (hour < 17) {
                            newTimeGroups.afternoon.push(slot);
                        } else {
                            newTimeGroups.evening.push(slot);
                        }

                        slots.push(slot);

                        // Increment by 30 minutes
                        currentTime.setMinutes(currentTime.getMinutes() + 30);
                    }
                } catch (e) {
                    console.error("Error processing time slot:", e);
                }
            });

            // Sort time slots chronologically
            slots.sort((a, b) => {
                const timeA = new Date(`2000-01-01T${a.time}`).getTime();
                const timeB = new Date(`2000-01-01T${b.time}`).getTime();
                return timeA - timeB;
            });

            // Update state with new time slots and groups
            setTimeSlots(slots);
            setTimeGroups(newTimeGroups);

            // Display doctor's overall availability range
            if (doctor.available_time.length > 0) {
                try {
                    // Find earliest start time and latest end time
                    const startTimes = doctor.available_time.map((t: any) => t.start_time);
                    const endTimes = doctor.available_time.map((t: any) => t.end_time);

                    if (startTimes.length && endTimes.length) {
                        // Sort times for accurate first and last
                        startTimes.sort();
                        endTimes.sort();

                        const earliestStartTime = startTimes[0]; // First start time
                        const latestEndTime = endTimes[endTimes.length - 1]; // Last end time

                        // Convert to display format
                        const displayStart = new Date(`2000-01-01T${earliestStartTime}`);
                        const displayEnd = new Date(`2000-01-01T${latestEndTime}`);

                        setDoctorAvailabilityRange({
                            start: displayStart.toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit', hour12: true
                            }),
                            end: displayEnd.toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit', hour12: true
                            })
                        });
                    }
                } catch (e) {
                    console.error("Error calculating availability range:", e);
                }
            }
        }
    }, [doctor]);

    // Get filtered time slots with improved error handling
    // const getFilteredTimeSlots = () => {
    //     try {
    //         if (!timeSlots || timeSlots.length === 0) {
    //             return [];
    //         }

    //         if (timeFilter === 'all' || !timeGroups) {
    //             return timeSlots;
    //         }

    //         const groupedSlots = timeGroups[timeFilter];
    //         return groupedSlots && groupedSlots.length > 0 ? groupedSlots : [];
    //     } catch (error) {
    //         console.error("Error filtering time slots:", error);
    //         return timeSlots || []; // Return all slots or empty array as fallback
    //     }
    // };

    // Use regular state with proper error handling instead of previous approach
    // const handleTimeFilterChange = (filter: string) => {
    //     // Direct state update with no delay or navigation dependency
    //     setTimeFilter(filter);
    // };

    // Simplified time slot generation directly from doctor's available times
    useEffect(() => {
        if (doctor && doctor.available_time && doctor.available_time.length > 0) {
            const slots: TimeSlot[] = [];

            // Extract time directly from doctor's available times - simplified
            doctor.available_time.forEach((timeSlot: any) => {
                try {
                    // Get the original start time
                    const startTime = new Date(`2000-01-01T${timeSlot.start_time}`);
                    const endTime = new Date(`2000-01-01T${timeSlot.end_time}`);

                    // Format the time for display
                    const formattedStartTime = startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });

                    // Create a slot for this start time
                    const slot = {
                        id: `${timeSlot.id}-${formattedStartTime}`,
                        time: formattedStartTime,
                        isAvailable: true,
                        endTime: endTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }),
                        originalStartTime: timeSlot.start_time
                    };

                    slots.push(slot);
                } catch (e) {
                    console.error("Error processing time slot:", e);
                }
            });

            // Sort time slots chronologically
            slots.sort((a, b) => {
                const timeA = new Date(`2000-01-01T${a.originalStartTime}`).getTime();
                const timeB = new Date(`2000-01-01T${b.originalStartTime}`).getTime();
                return timeA - timeB;
            });

            setTimeSlots(slots);

            // Display doctor's overall availability range
            if (doctor.available_time.length > 0) {
                // ...existing code for doctor availability range...
            }
        }
    }, [doctor]);

    // Simplified: Just return all time slots directly
    const getAvailableTimeSlots = () => {
        return timeSlots || [];
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-1"
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-lg font-JakartaBold text-gray-800">Book Appointment</Text>
                <View className="w-6" />
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Patient Info */}
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <Text className="text-lg font-JakartaSemiBold mb-2">
                        Patient: {patient?.name || 'Loading...'}
                    </Text>
                </View>

                {/* Doctor Info Summary */}
                <View className="bg-white flex-row justify-between items-center rounded-xl p-4 mb-4 shadow-sm">
                    <View>
                        <Text className="text-lg font-JakartaSemiBold mb-2">
                            {Array.isArray(doctorName) ? doctorName[0] : doctorName}
                        </Text>
                        <View className="flex-row items-center">
                            <MaterialIcons name="medical-services" size={16} color="#0066CC" />
                            <Text className="ml-2 text-gray-700">
                                {doctor?.specialties ? doctor.specialties.map((specialty: any) => specialty.name || 'Specialist').join(', ') : 'General Physician'}
                            </Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="cash-outline" size={16} color="#0066CC" />
                            <Text className="ml-2 text-gray-700">
                                Consultation Fee: {calculateConsultationFee()}
                            </Text>
                        </View>
                    </View>
                    <View>
                        {doctor?.profile_picture && (
                            <Image
                                source={{ uri: doctor.profile_picture }}
                                className="w-16 h-16 rounded-md mb-2"
                            />
                        )}
                    </View>
                </View>

                {/* Select Date */}
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <Text className="text-base font-JakartaSemiBold mb-3">
                        Select Date
                    </Text>

                    <TouchableOpacity
                        className="flex-row items-center justify-between border border-gray-200 p-3 rounded-lg"
                        onPress={() => setCalendarVisible(true)}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="calendar" size={20} color="#0066CC" />
                            <Text className="ml-2 text-gray-700">
                                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                }) : 'Select a date'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>

                    <Text className="text-gray-500 text-sm mt-2 italic">
                        * Only available days are selectable
                    </Text>
                </View>

                {/* Simplified Time Slot Section - No filters */}
                <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-base font-JakartaSemiBold">
                            Available Time Slots
                        </Text>

                        {doctorAvailabilityRange && (
                            <View className="flex-row items-center bg-blue-50 rounded-full py-1 px-3">
                                <Ionicons name="time-outline" size={14} color="#0066CC" />
                                <Text className="text-xs text-blue-700 ml-1 font-JakartaMedium">
                                    {doctorAvailabilityRange.start} - {doctorAvailabilityRange.end}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Direct Time Slots Grid - No filtering */}
                    <View className="flex-row flex-wrap">
                        {getAvailableTimeSlots().map((slot) => (
                            <TouchableOpacity
                                key={slot.id}
                                className={`py-3 px-4 rounded-lg mr-2 mb-3 border ${selectedTimeSlot === slot.time
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-blue-50 border-blue-100'
                                    }`}
                                onPress={() => setSelectedTimeSlot(slot.time)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className={`text-sm font-JakartaMedium text-center ${selectedTimeSlot === slot.time
                                        ? 'text-white'
                                        : 'text-blue-600'
                                        }`}
                                >
                                    {slot.time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Empty state - simplified */}
                    {getAvailableTimeSlots().length === 0 && (
                        <View className="py-8 items-center">
                            <Ionicons name="time-outline" size={32} color="#CBD5E1" />
                            <Text className="text-gray-500 text-center mt-2">
                                No available time slots for this doctor
                            </Text>
                        </View>
                    )}

                    {/* Note about time slots */}
                    <Text className="text-xs text-gray-500 mt-3 italic">
                        * Appointments typically last 30-45 minutes. Please arrive 15 minutes before your scheduled time.
                    </Text>
                </View>

                {/* Show submission error message if present */}
                {submissionError && (
                    <View className="mx-4 my-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <Text className="text-red-700 text-sm">
                            {submissionError instanceof Error
                                ? submissionError.message
                                : 'An error occurred during booking. Please try again.'}
                        </Text>
                    </View>
                )}

                {/* Booking Button - Updated to show submission state */}
                <View className="px-4 pb-6">
                    <Button
                        text={isSubmitting ? "Submitting..." : "Confirm Appointment"}
                        onClick={handleConfirmBooking}
                        disabled={!selectedDate || !selectedTimeSlot || isSubmitting}
                    />

                    {/* Show disclaimer text */}
                    <Text className="text-xs text-gray-500 text-center mt-3">
                        By confirming this appointment, you agree to our Terms of Service and Privacy Policy.
                    </Text>
                </View>
            </ScrollView>

            {/* Calendar Modal - Updated for better available date handling */}
            <Modal
                visible={calendarVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCalendarVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-5">
                    <View className="bg-white w-full rounded-2xl overflow-hidden">
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                            <Text className="text-lg font-JakartaBold text-gray-800">Select Date</Text>
                            <TouchableOpacity
                                onPress={() => setCalendarVisible(false)}
                                className="p-1"
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Helper Text */}
                        <View className="bg-blue-50 px-4 py-2.5">
                            <Text className="text-center text-blue-700 text-sm">
                                Only days with blue dots are available for booking
                            </Text>
                        </View>

                        {/* Calendar - Updated with better unavailable day handling */}
                        <Calendar
                            markedDates={availableDates}
                            onDayPress={(day: { dateString: string; }) => {
                                handleDateSelect(day.dateString);
                            }}
                            minDate={new Date().toISOString().split('T')[0]}
                            disableAllTouchEventsForDisabledDays={true}
                            theme={{
                                todayTextColor: '#0066CC',
                                arrowColor: '#0066CC',
                                dotColor: '#0066CC',
                                selectedDotColor: '#ffffff',
                                textDayFontFamily: 'System',
                                textMonthFontFamily: 'System',
                                textDayHeaderFontFamily: 'System',
                                textDayFontWeight: '400',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '500',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 14,
                                textDisabledColor: '#d3d3d3', // Make disabled dates more obvious
                                dayTextColor: '#333', // Normal day text color
                                selectedDayBackgroundColor: '#0066CC',
                                selectedDayTextColor: '#ffffff'
                            }}
                        />

                        {/* Calendar Legend - Improved */}
                        <View className="flex-row justify-center items-center py-4 px-4 bg-gray-50">
                            <View className="flex-row items-center mr-4">
                                <View className="w-3 h-3 rounded-full bg-blue-600 mr-2" />
                                <Text className="text-xs text-gray-600">Available</Text>
                            </View>
                            <View className="flex-row items-center mr-4">
                                <View className="w-3 h-3 rounded border border-gray-300 mr-2" />
                                <Text className="text-xs text-gray-400">Unavailable</Text>
                            </View>
                            <View className="flex-row items-center">
                                <View className="w-3 h-3 bg-blue-600 rounded-sm mr-2" />
                                <Text className="text-xs text-gray-600">Selected</Text>
                            </View>
                        </View>

                        {/* Footer */}
                        <View className="flex-row justify-end items-center p-4 border-t border-gray-100">
                            <TouchableOpacity
                                onPress={() => setCalendarVisible(false)}
                                className="py-2 px-4 mr-2"
                            >
                                <Text className="text-gray-600 font-JakartaMedium">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setCalendarVisible(false)}
                                className={`py-2 px-5 rounded-lg ${selectedDate ? 'bg-blue-600' : 'bg-gray-300'}`}
                                disabled={!selectedDate}
                            >
                                <Text className={`font-JakartaSemiBold ${selectedDate ? 'text-white' : 'text-gray-500'}`}>
                                    Confirm
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Booking Receipt Modal */}
            <Modal
                visible={showReceipt}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowReceipt(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-5">
                    <View className="bg-white w-full rounded-2xl overflow-hidden max-h-[90%]">
                        {/* Receipt Header */}
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                            <Text className="text-lg font-JakartaBold text-gray-800">Appointment Details</Text>
                            <TouchableOpacity
                                onPress={() => setShowReceipt(false)}
                                className="p-1"
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Receipt Content */}
                        <ScrollView className="p-5">
                            <View className="items-center my-4">
                                <View className="w-16 h-16 bg-blue-100 rounded-full justify-center items-center">
                                    <FontAwesome5 name="hospital-user" size={30} color="#0066CC" />
                                </View>
                            </View>

                            <Text className="text-xl font-JakartaBold text-center text-gray-800 mb-5">
                                Appointment Confirmed
                            </Text>

                            {/* Show real booking data in receipt */}
                            <View className="bg-blue-50 p-4 rounded-xl mb-6">
                                <View className="flex-row justify-between py-2 border-b border-blue-100">
                                    <Text className="text-gray-600 font-JakartaMedium">Doctor:</Text>
                                    <Text className="text-gray-900 font-JakartaSemiBold text-right max-w-[60%]">
                                        {receipt?.doctorName}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between py-2 border-b border-blue-100">
                                    <Text className="text-gray-600 font-JakartaMedium">Specialty:</Text>
                                    <Text className="text-gray-900 font-JakartaSemiBold text-right">
                                        {receipt?.doctorSpecialty}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between py-2 border-b border-blue-100">
                                    <Text className="text-gray-600 font-JakartaMedium">Date:</Text>
                                    <Text className="text-gray-900 font-JakartaSemiBold text-right max-w-[60%]">
                                        {receipt?.appointmentDate}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between py-2">
                                    <Text className="text-gray-600 font-JakartaMedium">Time:</Text>
                                    <Text className="text-gray-900 font-JakartaSemiBold">
                                        {receipt?.appointmentTime}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl mb-6">
                                <Text className="text-gray-600 font-JakartaBold">Consultation Fee:</Text>
                                <Text className="text-xl font-JakartaBold text-blue-600">
                                    ₹{receipt?.appointmentFee}
                                </Text>
                            </View>

                            <View className="bg-blue-600/10 p-5 rounded-xl items-center mb-6">
                                <Text className="text-sm text-blue-600 mb-1">Booking Reference</Text>
                                <Text className="text-2xl font-JakartaBold text-blue-600">
                                    {receipt?.bookingId}
                                </Text>
                            </View>

                            <View className="bg-blue-600/10 p-5 rounded-xl items-center mb-6">
                                <Text className="text-sm text-blue-600 mb-1">Ticket Number</Text>
                                <Text className="text-2xl font-JakartaBold text-blue-600">
                                    {receipt?.ticketNumber}
                                </Text>
                            </View>

                            <View className="bg-blue-600/10 p-5 rounded-xl items-center mb-6">
                                <Text className="text-sm text-blue-600 mb-1">QR Code</Text>
                                {receipt?.qrCode && (
                                    <Image
                                        source={{ uri: receipt.qrCode }}
                                        className="w-32 h-32"
                                    />
                                )}
                            </View>

                            <TouchableOpacity
                                className="bg-blue-600 py-4 rounded-xl items-center mb-4"
                                onPress={handleCompleteBooking}
                            >
                                <Text className="text-white font-JakartaBold text-base">
                                    Done
                                </Text>
                            </TouchableOpacity>

                            <Text className="text-gray-400 text-xs text-center mb-2">
                                A copy of your booking details has been sent to your email
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* FIXED Success Screen */}
            {bookingComplete && (
                <View className="absolute inset-0 bg-gray-50 justify-center items-center p-5">
                    <View className="bg-white p-6 rounded-2xl w-full shadow-sm items-center">
                        <View className="w-20 h-20 bg-green-100 rounded-full mb-4 justify-center items-center">
                            <Ionicons name="checkmark" size={40} color="#22C55E" />
                        </View>
                        <Text className="text-2xl font-JakartaBold text-center">Booking Successful!</Text>
                        <Text className="text-gray-600 text-center mt-2 mb-4">
                            Your appointment has been booked successfully.
                            You will receive a confirmation email shortly.
                        </Text>
                        <Text className="text-blue-600 font-JakartaSemiBold mb-6">
                            Booking ID: {receipt?.bookingId}
                        </Text>
                        <Text className="text-gray-500">Redirecting to home...</Text>
                    </View>
                </View>
            )}

            {/* Loading overlay with Tailwind */}
            {isBookingLoading && (
                <View className="absolute inset-0 bg-black/70 justify-center items-center">
                    <View className="bg-white/10 p-6 rounded-2xl items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-white mt-3 font-JakartaMedium">
                            Processing your booking...
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default BookingScreen;

