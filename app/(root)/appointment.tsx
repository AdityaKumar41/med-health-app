import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FilterButton } from '@/components/ui/FilterButton';
import { DoctorCard } from '@/components/DoctorCard';
import InputField from '@/components/InputField';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useDoctorBySpecialization } from '@/hooks/useSpecialization';

// Define type for doctor object from API response
interface Doctor {
  doctor_id: string;
  name: string;
  specialties: string[];
  qualification: string;
  experience: number;
  profile_picture: string;
  average_rating: number | null;
  hospital: string;
  consultancy_fees: number;
}

const AppointmentScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // get details from params
  const { id } = useLocalSearchParams()
  const { data, isLoading } = useDoctorBySpecialization(Array.isArray(id) ? id[0] : id);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Get doctors from API response
  const apiDoctors = data?.data || [];

  // Filter doctors based on search query
  const filteredDoctors = searchQuery
    ? apiDoctors.filter((doctor: { name: string; }) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : apiDoctors;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Header with back button */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-1 mr-8">
            <Text className="text-xl font-JakartaBold text-center">Find Doctors</Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          {/* Search and Filter Section */}
          <View className="px-4 bg-white">
            {/* Search Input */}
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <InputField
                  placeholder="Search doctors, specialties..."
                  className="h-12 px-4 bg-white rounded-xl border border-gray-300"
                  label={''}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
          </View>

          {/* Doctors List */}
          <ScrollView
            className="flex-1 px-4 pt-2"
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View className="flex-1 justify-center items-center py-10">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-2">Loading doctors...</Text>
              </View>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor: Doctor) => (
                <TouchableOpacity
                  key={doctor.doctor_id}
                  onPress={() => router.push({
                    pathname: '/(root)/doctor-profile',
                    params: { id: doctor.doctor_id }
                  })}
                  activeOpacity={0.7}
                  style={{ width: '100%' }}
                >
                  <DoctorCard
                    name={doctor.name}
                    specialty={doctor.qualification || 'Specialist'}
                    price={doctor.consultancy_fees || 0}
                    rating={doctor.average_rating?.toString() || 'N/A'}
                    imageUrl={doctor.profile_picture || 'https://cdn.builder.io/api/v1/image/assets/TEMP/e37229356691a4f10f5ae1f014d211357e18d13fe8f2a634748704b4c4201882'}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View className="flex-1 justify-center items-center py-10">
                <Text>No doctors found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AppointmentScreen;