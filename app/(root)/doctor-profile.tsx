import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Share,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useDoctorbyId } from '@/hooks/useDoctor';
import { Button } from '@/components/ui/Button';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Define doctor type based on the response data
interface DoctorAvailableTime {
    id: string;
    start_time: string;
    end_time: string;
    doctor_id: string;
    createdAt: string;
    updatedAt: string;
}

interface DoctorSpecialty {
    id: string;
    specialty_id: string;
    doctor_id: string;
    createdAt: string;
    updatedAt: string;
}

const specialtyNames: Record<string, string> = {
    'cl8x12345': 'Cardiology',
    'cl8x12346': 'Neurology',
    // Add more specialty mappings as needed
};

const DoctorProfileScreen: React.FC = () => {
    const navigation = useNavigation();

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const { id } = useLocalSearchParams();
    const doctorId = Array.isArray(id) ? id[0] : id || '';

    // Using your doctor hook to fetch data
    const { data, isLoading, error } = useDoctorbyId(doctorId);

    const doctor = data?.data;

    console.log('Doctor:', doctor);

    const router = useRouter();


    // Format consultation fee based on experience
    const calculateConsultationFee = (experience: number) => {
        const basePrice = 800 + (experience * 100);
        return `₹${basePrice}`;
    };

    // Get doctor's specialties as readable string
    const getSpecialties = () => {
        if (!doctor?.specialties) return 'Specialist';

        return doctor.specialties
            .map((specialty: DoctorSpecialty) => specialtyNames[specialty.specialty_id] || 'Specialist')
            .join(', ');
    };

    // Format time string (e.g., "09:00" to "9:00 AM")
    const formatTime = (timeString: string) => {
        try {
            const [hours, minutes] = timeString.split(':');
            let hour = parseInt(hours, 10);
            const period = hour >= 12 ? 'PM' : 'AM';

            if (hour === 0) hour = 12;
            if (hour > 12) hour -= 12;

            return `${hour}:${minutes} ${period}`;
        } catch (e) {
            return timeString;
        }
    };

    // Parse latitude and longitude to valid numbers
    const parseLocation = (location: any) => {
        try {
            const parsedLocation = typeof location === 'string' ? parseFloat(location) : location;
            console.log('Parsed location:', parsedLocation); // Add logging
            return parsedLocation;
        } catch (e) {
            console.error('Error parsing location:', e);
            return null;
        }
    };

    // Check if coordinates are valid
    const hasValidCoordinates = () => {
        if (!doctor) return false;

        const lat = parseLocation(doctor.location_lat);
        const lng = parseLocation(doctor.location_lng);

        return (
            lat !== null &&
            lng !== null &&
            !isNaN(lat) &&
            !isNaN(lng) &&
            Math.abs(lat) <= 90 &&
            Math.abs(lng) <= 180
        );
    };

    // Handle booking appointment
    const handleBookAppointment = () => {
        router.push({
            pathname: '/(root)/booking',
            params: {
                doctorId: doctor?.doctor_id,
                doctorName: doctor?.name,
            }
        });
    };

    // Handle sharing the doctor's profile
    const handleShareProfile = async () => {
        try {
            // const profileLink = `http://192.168.0.208/(root)/doctor-profile/${doctor?.doctor_id}`;
            // const imageUrl = doctor?.profile_picture;

            // Download the image to the local file system
            // const downloadResumable = FileSystem.createDownloadResumable(
            //     imageUrl,
            //     FileSystem.documentDirectory + 'profile_picture.jpg'
            // );

            // const result = await downloadResumable.downloadAsync();
            // if (!result) return;
            // const { uri } = result;

            // Combine text and image sharing
            await Share.share({
                message: `Check out ${doctor?.name}, a specialist in ${getSpecialties()} at ${doctor?.hospital}.`,
                title: `Dr. ${doctor?.name}'s Profile`,
            }, {
                dialogTitle: `Share Dr. ${doctor?.name}'s Profile`,
                tintColor: '#0066CC',
            });


        } catch (error) {
            console.error('Error sharing profile:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0066CC" />
                    <Text className="mt-3 text-gray-600">Loading doctor profile...</Text>
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center p-5">
                    <Text className="text-red-500 text-lg mb-4 text-center">Failed to load doctor details</Text>
                    <TouchableOpacity
                        className="bg-blue-600 py-2 px-6 rounded-lg"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-semibold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : doctor ? (
                <>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="p-1"
                        >
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text className="text-lg font-JakartaBold text-gray-800">Doctor Profile</Text>
                        <TouchableOpacity className="p-1" onPress={handleShareProfile}>
                            <Ionicons name="share-outline" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Doctor Profile Card */}
                        <View className="bg-white m-3 rounded-xl p-4 shadow-sm">
                            <View className="flex-row">
                                <Image
                                    source={{ uri: doctor.profile_picture }}
                                    className="w-[90px] h-[90px] rounded-full mr-4"
                                />
                                <View className="flex-1">
                                    <Text className="text-xl font-JakartaBold text-gray-800 mb-1">
                                        {doctor.name}
                                    </Text>
                                    <Text className="text-blue-600 font-JakartaMedium mb-0.5">
                                        {getSpecialties()}
                                    </Text>
                                    <Text className="text-gray-600 mb-2">
                                        {doctor.qualification}
                                    </Text>

                                    <View className="flex-row items-center mt-1">
                                        <View className="flex-row items-center">
                                            <Ionicons name="star" size={16} color="#FFD700" />
                                            <Text className="ml-1 text-gray-600">
                                                {doctor.average_rating || 'New'}
                                            </Text>
                                        </View>
                                        <View className="w-[1px] h-4 bg-gray-300 mx-3" />
                                        <View className="flex-row items-center">
                                            <MaterialIcons name="work" size={16} color="#0066CC" />
                                            <Text className="ml-1 text-gray-600">
                                                {doctor.experience} Years
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="mt-4 pt-4 border-t border-gray-100">
                                <Text className="text-base font-JakartaSemiBold text-gray-800 mb-2">
                                    About
                                </Text>
                                <Text className="text-gray-600 leading-5">
                                    {doctor.bio}
                                </Text>
                            </View>
                        </View>

                        {/* Hospital & Location */}
                        <View className="bg-white mx-3 mb-3 rounded-xl p-4 shadow-sm">
                            <Text className="text-base font-JakartaSemiBold text-gray-800 mb-3">
                                Hospital
                            </Text>
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="medical" size={20} color="#0066CC" />
                                <Text className="ml-2 text-gray-700">
                                    {doctor.hospital}
                                </Text>
                            </View>

                            {/* Map View with improved error handling */}
                            {hasValidCoordinates() ? (
                                <View className="h-[180px] rounded-lg mt-2 overflow-hidden">
                                    <MapView
                                        style={{ flex: 1 }}
                                        initialRegion={{
                                            latitude: parseLocation(doctor.location_lat),
                                            longitude: parseLocation(doctor.location_lng),
                                            latitudeDelta: 0.01,
                                            longitudeDelta: 0.01,
                                        }}
                                        customMapStyle={[
                                            {
                                                "featureType": "water",
                                                "elementType": "geometry",
                                                "stylers": [{ "color": "#E9E9E9" }]
                                            },
                                            {
                                                "featureType": "road",
                                                "elementType": "geometry",
                                                "stylers": [{ "color": "#FFFFFF" }]
                                            },
                                            {
                                                "featureType": "landscape",
                                                "elementType": "geometry",
                                                "stylers": [{ "color": "#F5F5F5" }]
                                            }
                                        ]}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: parseLocation(doctor.location_lat),
                                                longitude: parseLocation(doctor.location_lng),
                                            }}
                                            title={doctor.name}
                                            description={doctor.hospital}
                                        >
                                            <View className="bg-blue-600 p rounded-lg">
                                                <MaterialIcons name="local-hospital" size={24} color="#FFFFFF" />
                                            </View>
                                        </Marker>
                                    </MapView>
                                </View>
                            ) : (
                                <View className="h-[180px] rounded-lg overflow-hidden mt-2 bg-gray-100 justify-center items-center">
                                    <Ionicons name="location-outline" size={32} color="#999" />
                                    <Text className="text-gray-500 mt-2">Location map not available</Text>
                                </View>
                            )}
                        </View>

                        {/* Education & Experience */}
                        <View className="bg-white mx-3 mb-3 rounded-xl p-4 shadow-sm">
                            <Text className="text-base font-JakartaSemiBold text-gray-800 mb-3">
                                Qualification & Experience
                            </Text>
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="school-outline" size={20} color="#0066CC" />
                                <Text className="ml-2 text-gray-700">
                                    {doctor.qualification}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <MaterialIcons name="psychology" size={20} color="#0066CC" />
                                <Text className="ml-2 text-gray-700">
                                    {doctor.experience} years of clinical experience
                                </Text>
                            </View>
                        </View>

                        {/* Availability */}
                        <View className="bg-white mx-3 mb-3 rounded-xl p-4 shadow-sm">
                            <Text className="text-base font-JakartaSemiBold text-gray-800 mb-3">
                                Availability
                            </Text>

                            {/* Days */}
                            <Text className="text-sm font-JakartaMedium text-gray-700 mb-2">
                                Available Days
                            </Text>
                            <View className="flex-row flex-wrap mb-4">
                                {doctor.available_days && doctor.available_days.map((day: string, index: number) => (
                                    <View
                                        key={index}
                                        className="py-1.5 px-3 rounded-full mr-2 mb-2 bg-blue-50"
                                    >
                                        <Text className="text-sm font-JakartaMedium text-blue-600">
                                            {day}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Hours */}
                            <Text className="text-sm font-JakartaMedium text-gray-700 mb-2">
                                Available Hours
                            </Text>
                            <View className="mb-1">
                                {doctor.available_time && doctor.available_time.map((timeSlot: DoctorAvailableTime, index: number) => (
                                    <View key={index} className="flex-row items-center py-1.5">
                                        <Ionicons name="time-outline" size={16} color="#0066CC" />
                                        <Text className="ml-2 text-gray-700">
                                            {formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Consultation Fee and Book Button */}
                        <View className="bg-white mx-3 mb-6 rounded-xl p-4 shadow-sm flex-row justify-between items-center">
                            <View>
                                <Text className="text-sm text-gray-500 mb-1">
                                    Consultation Fee
                                </Text>
                                <Text className="text-xl font-JakartaBold text-gray-800">
                                    {calculateConsultationFee(doctor.experience)}
                                </Text>
                            </View>

                            <Button
                                onClick={handleBookAppointment}
                                text="Book Appointment"
                                className='w-[200px]'
                            />
                        </View>
                    </ScrollView>
                </>
            ) : (
                <View className="flex-1 justify-center items-center p-5">
                    <Text className="text-gray-500 text-lg mb-4">Doctor not found</Text>
                    <TouchableOpacity
                        className="bg-blue-600 py-2 px-6 rounded-lg"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-semibold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default DoctorProfileScreen;
