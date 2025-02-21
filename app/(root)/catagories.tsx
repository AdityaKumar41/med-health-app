import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SearchBar } from '@/components/SearchBar';
import { SpecialtyCard } from '@/components/SpecialtyCard';
import { useNavigation, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSpecialization } from '@/hooks/useSpecialization';

export const specialties = [
  {
    emoji: "👨‍⚕️",
    title: "General Practitioner",
    description: "Primary healthcare provider",
    count: 45
  },
  {
    emoji: "🫀",
    title: "Cardiologist",
    description: "Heart and blood vessel specialist",
    count: 12
  },
  {
    emoji: "🧠",
    title: "Neurologist",
    description: "Brain and nervous system expert",
    count: 8
  },
  {
    emoji: "👂",
    title: "ENT Specialist",
    description: "Ear, nose, and throat doctor",
    count: 15
  },
  {
    emoji: "🦷",
    title: "Dentist",
    description: "Dental and oral health care",
    count: 23
  },
  {
    emoji: "👁️",
    title: "Ophthalmologist",
    description: "Eye care specialist",
    count: 9
  }
];

const AppointmentBooking: React.FC = () => {
  const navigation = useNavigation();
  const { data, error } = useSpecialization()
  console.log(data, error)

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView className="bg-white">
      {/* Header */}
      <View className="px-4 pt-2 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-50"
          >
            <Ionicons name="arrow-back" size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-JakartaBold text-center text-gray-900 mr-10">
            Book Appointment
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View className="p-4">
          <Text className="font-JakartaBold text-3xl text-gray-900">
            Medical Specialties
          </Text>
          <Text className="font-Jakarta text-base text-gray-600 mt-1">
            Find the right specialist for your needs
          </Text>
        </View>

        {/* Search Section */}
        <View className="px-4 mb-4">
          <SearchBar
            placeholder="Search symptoms or specialties..."
          />
        </View>

        {/* Popular Categories */}
        <View className="px-4 mb-3">
          <Text className="font-JakartaBold text-lg text-gray-800 mb-3">
            Popular Categories
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {specialties.slice(0, 4).map((specialty, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.delay(index * 100)}
                className="w-[48%] mb-3"
              >
                <TouchableOpacity
                  className="bg-gray-50 p-4 rounded-2xl"
                  onPress={() => {/* Handle specialty selection */ }}
                >
                  <Text className="text-3xl mb-2">{specialty.emoji}</Text>
                  <Text className="font-JakartaBold text-gray-900">
                    {specialty.title}
                  </Text>
                  <Text className="font-Jakarta text-xs text-gray-500 mt-1">
                    {specialty.count} doctors
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* All Specialties */}
        <View className="px-4 pb-6">
          <Text className="font-JakartaBold text-lg text-gray-800 mb-3">
            All Specialties
          </Text>
          {specialties.map((specialty, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(index * 50)}
            >
              <TouchableOpacity
                className="flex-row items-center bg-white border border-gray-100 rounded-xl p-4 mb-3"
                onPress={() => {/* Handle specialty selection */ }}
              >
                <Text className="text-3xl mr-4">{specialty.emoji}</Text>
                <View className="flex-1">
                  <Text className="font-JakartaBold text-gray-900">{specialty.title}</Text>
                  <Text className="font-Jakarta text-sm text-gray-500">{specialty.description}</Text>
                </View>
                <View className="bg-blue-50 px-2 py-1 rounded-full">
                  <Text className="font-JakartaMedium text-xs text-blue-600">
                    {specialty.count} doctors
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppointmentBooking;