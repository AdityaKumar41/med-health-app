import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePatient } from '@/hooks/usePatient';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { useDoctorsByIds } from '@/hooks/useDoctor';
import { AppointmentSchema } from '@/types/type';
import { useChat } from '@/context/useChatProvider';
import { useAppointmentPending } from '@/hooks/useAppointment';

interface Specialty {
  id: string;
  specialty_id: string;
  doctor_id: string;
  specialty: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string | null;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Doctor {
  id: string;
  doctor_id: string;
  name: string;
  email: string;
  age: number;
  wallet_address: string;
  profile_picture: string;
  hospital: string;
  experience: number;
  qualification: string;
  bio: string;
  specialties: Specialty[];
  // ...other properties...
}

const Chat = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorIds, setDoctorIds] = useState<string[]>([]);
  const { address } = useAccount();
  const { data: patientData, error: patientError } = usePatient(address!);

  // Use the pending appointments hook instead of filtering manually
  const { data: pendingAppointments, isLoading: isPendingLoading } = useAppointmentPending(address!);

  const { data: doctorsResponse, error: doctorsError, isLoading: isDoctorsLoading } = useDoctorsByIds(doctorIds);
  const { onlineUsers } = useChat();

  // Update doctor IDs collection from both data sources
  useEffect(() => {
    const collectDoctorIds = () => {
      const ids = new Set<string>();

      // Add IDs from patient data (all appointments)
      if (patientData?.appointments) {
        patientData.appointments.forEach((appointment: AppointmentSchema) => {
          if (appointment.doctor_id) {
            ids.add(appointment.doctor_id);
          }
        });
      }

      // Set the collected IDs
      setDoctorIds(Array.from(ids));
    };

    collectDoctorIds();
  }, [patientData, pendingAppointments]);

  // Update navigation to include appointment status
  const handleChatPress = (doctor: any) => {
    const appointment = patientData?.appointments.find((appt: any) => appt.doctor_id === doctor.id);

    // Only allow chat for non-pending appointments
    if (appointment && appointment.status !== 'pending') {
      router.push({
        pathname: '/(root)/chating',
        params: {
          doctorId: doctor.id,
          doctorName: doctor.name,
          profilePicture: doctor.profile_picture,
          specialty: doctor.specialties.map((spec: any) => spec.specialty.name).join(', '),
          appointmentStatus: appointment.status
        }
      });
    }
  };

  // Check if an appointment is pending using the pendingAppointments data
  const isAppointmentPending = (doctorId: string) => {
    if (!pendingAppointments) return false;

    return pendingAppointments.some(
      (appt: any) => appt.doctor_id === doctorId && appt.status === 'pending'
    );
  };

  // Get appointment status for a doctor
  const getAppointmentStatus = (doctorId: string) => {
    const appointment = patientData?.appointments.find(
      (appt: any) => appt.doctor_id === doctorId
    );
    return appointment?.status || 'unknown';
  };

  // Filter and sort doctors
  const filteredDoctors = useMemo(() => {
    if (!doctorsResponse?.data || !Array.isArray(doctorsResponse.data)) return [];

    return doctorsResponse.data
      .filter((doctor: any) => {
        if (!doctor || typeof doctor.name !== 'string') return false;
        return doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a: any, b: any) => {
        // Sort by appointment status (completed last)
        const statusA = getAppointmentStatus(a.id);
        const statusB = getAppointmentStatus(b.id);

        if (statusA === 'completed' && statusB !== 'completed') return 1;
        if (statusA !== 'completed' && statusB === 'completed') return -1;

        return 0;
      });
  }, [doctorsResponse, searchQuery, patientData]);

  const isLoading = isPendingLoading || isDoctorsLoading;

  return (
    <SafeAreaView className="flex-1 h-full bg-white">
      {/* Header */}
      <View className="bg-white px-4 pt-6 pb-4">
        <Text className="text-2xl font-JakartaBold text-gray-900">Messages</Text>
        <Text className="text-base font-Jakarta text-gray-500 mt-1">
          Chat with your healthcare providers
        </Text>

        {/* Search Bar */}
        <View className="mt-4 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 font-Jakarta text-base"
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Chat List */}
      <ScrollView className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-2">Loading doctors...</Text>
          </View>
        ) : filteredDoctors.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500">No appointments found.</Text>
          </View>
        ) : (
          filteredDoctors.map((doctor: any) => {
            const appointmentStatus = getAppointmentStatus(doctor.id);
            const isPending = appointmentStatus === 'pending';
            const isCompleted = appointmentStatus === 'completed';

            return (
              <TouchableOpacity
                key={doctor.id}
                className={`px-4 py-3 bg-white border-b border-gray-100 flex-row items-center ${isCompleted ? 'opacity-70' : ''}`}
                onPress={() => handleChatPress(doctor)}
                disabled={isPending}
              >
                {/* Doctor Avatar with Online Status */}
                <View className="relative">
                  <Image
                    source={{ uri: doctor.profile_picture }}
                    className="w-16 h-16 rounded-full"
                  />
                  {onlineUsers.has(doctor.id) ? (
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  ) : (
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </View>

                {/* Chat Details */}
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-JakartaBold text-gray-900 text-base">
                      {doctor.name}
                    </Text>
                    {isPending ? (
                      <View className="bg-amber-100 px-2 py-1 rounded-full">
                        <Text className="text-amber-800 text-xs font-JakartaMedium">Pending</Text>
                      </View>
                    ) : isCompleted ? (
                      <View className="bg-gray-100 px-2 py-1 rounded-full">
                        <Text className="text-gray-600 text-xs font-JakartaMedium">Completed</Text>
                      </View>
                    ) : (
                      <View className="bg-green-100 px-2 py-1 rounded-full">
                        <Text className="text-green-800 text-xs font-JakartaMedium">Active</Text>
                      </View>
                    )}
                  </View>

                  <Text className="font-JakartaMedium text-xs text-blue-600 mb-1">
                    {doctor.specialties?.map((spec: any) => spec.specialty?.name).join(', ')}
                  </Text>

                  {isPending && (
                    <Text className="text-xs text-gray-500 mt-1 italic">
                      Chat will be available after appointment approval
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default Chat;