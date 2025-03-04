import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAccount } from "wagmi";
import { useAppointment } from "@/hooks/useAppointment";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { router } from "expo-router";

// Define status colors for visual clarity
const statusColors = {
  completed: "#4CAF50",
  cancelled: "#F44336",
  scheduled: "#2196F3",
  pending: "#FFC107",
  default: "#9E9E9E"
};

// Define appointment type
interface Specialty {
  id: string;
  doctor_id: string;
  specialty_id: string;
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
  location_lat: number;
  location_lng: number;
  available_days: string[];
  average_rating: number | null;
  consultancy_fees: number;
  specialties: Specialty[];
  createdAt: string;
  updatedAt: string;
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
}

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  status: string;
  appointment_fee: number;
  tx_hash: string;
  contract_appointment_id: string | null;
  is_active: boolean;
  amount_paid: number;
  createdAt: string;
  updatedAt: string;
  doctor: Doctor;
  ticket: Ticket;
}

const History = () => {
  const { address } = useAccount();
  const { data: sampdata, isLoading, error } = useAppointment(address!);
  const appointments = sampdata?.data || [];
  console.log(appointments.doctor);

  // Filter states
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredAppointments = activeFilter === "all"
    ? appointments
    : appointments.filter((item: Appointment) =>
      item.status.toLowerCase() === activeFilter.toLowerCase()
    );

  // Format the date to a more readable format
  const formatAppointmentDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Format the time to a more readable format
  const formatAppointmentTime = (timeString?: string) => {
    if (!timeString) return "";
    try {
      return format(parseISO(timeString), "h:mm a");
    } catch (e) {
      return timeString;
    }
  };

  // Get color based on appointment status
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    return statusColors[normalizedStatus as keyof typeof statusColors] || statusColors.default;
  };

  // Filter buttons
  const FilterButton = ({ title, filter }: { title: string, filter: string }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mr-2 ${activeFilter === filter ? 'bg-blue-500' : 'bg-gray-200'}`}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        className={`font-JakartaMedium ${activeFilter === filter ? 'text-white' : 'text-gray-700'}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      className="mb-4 bg-white rounded-xl shadow mx-4 overflow-hidden border border-gray-100"
      onPress={() => {
        if (item.doctor.id) {
          router.push({
            pathname: "/chating",
            params: {
              doctorId: item.doctor.id,
              doctorName: item.doctor.name,
              profilePicture: item.doctor.profile_picture,
              specialty: item.doctor.specialties.map(s => s.specialty_id).join(", ") || ""
            }
          });
        }
      }}
    >
      <View className="p-4">
        <View className="flex-row">
          <Image
            source={{ uri: item.doctor.profile_picture }}
            className="w-16 h-16 rounded-full"
            resizeMode="cover"
          />
          <View className="flex-1 ml-4 justify-center">
            <Text className="font-JakartaBold text-lg text-gray-800" numberOfLines={1}>
              {item.doctor.name}
            </Text>
            <Text className="text-gray-500 font-JakartaMedium text-sm" numberOfLines={1}>
              {item.doctor.hospital}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              {`Fee: ${item.appointment_fee} ETH`}
            </Text>
          </View>

          <View className="items-end">
            <View
              style={{ backgroundColor: getStatusColor(item.status), opacity: 0.15 }}
              className="px-3 py-1 rounded-full">
              <Text
                className="font-JakartaSemiBold text-xs"
                style={{ color: getStatusColor(item.status) }}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <View className="flex-row items-center flex-1">
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text className="text-gray-700 ml-1 font-JakartaMedium text-sm">
                {formatAppointmentDate(item.date)}
              </Text>
            </View>
          </View>

          {item.ticket && (
            <View className="mt-2 bg-gray-50 p-2 rounded-lg">
              <Text className="text-xs font-JakartaMedium text-gray-600">
                Ticket: {item.ticket.ticket_number}
              </Text>
              {item.ticket.notes && (
                <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
                  {item.ticket.notes}
                </Text>
              )}
            </View>
          )}

          <View className="mt-2 flex-row justify-end">
            <TouchableOpacity
              className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full"
              onPress={() => {
                router.push({
                  pathname: "/chating",
                  params: {
                    doctorId: item.doctor.id,
                    doctorName: item.doctor.name,
                    profilePicture: item.doctor.profile_picture,
                    specialty: item.doctor.specialties.map(s => s.specialty_id).join(", ") || ""
                  }
                });
              }}
            >
              <Ionicons name="chatbox-ellipses-outline" size={14} color="#3b82f6" />
              <Text className="text-blue-500 font-JakartaSemiBold ml-1 text-xs">Message Doctor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-500 font-JakartaMedium">Loading appointments...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="mt-2 text-red-500 font-JakartaBold">Failed to load appointments</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => {
            // Refresh data
          }}
        >
          <Text className="text-white font-JakartaMedium">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="py-4 px-4 bg-white border-b border-gray-100">
        <Text className="font-JakartaBold text-xl text-gray-800">Appointment History</Text>
        <Text className="text-base font-Jakarta text-gray-500 mt-1">
          View and manage your appointment history
        </Text>
      </View>

      <View className="px-4 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <FilterButton title="All" filter="all" />
          <FilterButton title="Scheduled" filter="scheduled" />
          <FilterButton title="Completed" filter="completed" />
          <FilterButton title="Cancelled" filter="cancelled" />
          <FilterButton title="Pending" filter="pending" />
        </ScrollView>
      </View>

      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center my-auto h-64">
            <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
            <Text className="text-gray-400 mt-4 font-JakartaMedium text-lg">
              No appointments found
            </Text>
            <Text className="text-gray-400 font-Jakarta text-center px-12 mt-2">
              You don't have any {activeFilter !== "all" ? activeFilter : ""} appointments yet
            </Text>
          </View>
        }
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default History;
