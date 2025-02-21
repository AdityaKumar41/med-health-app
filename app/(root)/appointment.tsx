import React, { useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SearchBar } from '@/components/SearchBar';
import { FilterButton } from '@/components/ui/FilterButton';
import { DoctorCard } from '@/components/DoctorCard';
import InputField from '@/components/InputField';
import { useNavigation, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";

export const doctorsData = [
  {
    name: "Dr. Patricia Ahoy",
    specialty: "Ear, Nose & Throat specialist",
    price: "IDR. 120.000",
    rating: "4.5",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/e37229356691a4f10f5ae1f014d211357e18d13fe8f2a634748704b4c4201882?placeholderIfAbsent=true&apiKey=2e39da48f85848aca22cf1d6f6e5c588"
  },
  {
    name: "Dr. Stone Gaze",
    specialty: "Ear, Nose & Throat specialist",
    price: "IDR. 120.000",
    rating: "4.5",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/8a1bc6d5bcab373f96b2e2a31bf5c6af9dcc16b86fa4ccf8c21bf620cfb04683?placeholderIfAbsent=true&apiKey=2e39da48f85848aca22cf1d6f6e5c588"
  },
  {
    name: "Dr. Wahyu",
    specialty: "Ear, Nose & Throat specialist",
    price: "IDR. 120.000",
    rating: "4.5",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/cd07fb7d99dd447d0971664e9e6dd11da987a433d861fce607270ebf331bfc86?placeholderIfAbsent=true&apiKey=2e39da48f85848aca22cf1d6f6e5c588"
  },
  {
    name: "Dr. Reza Razor",
    specialty: "Ear, Nose & Throat specialist",
    price: "IDR. 120.000",
    rating: "4.5",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/4d3cf00892e307ffa0eee3ce7be3e7d9bc32ee6e41f3d1d28e2ea470dfae0b72?placeholderIfAbsent=true&apiKey=2e39da48f85848aca22cf1d6f6e5c588"
  },
  {
    name: "Dr. Jacky Cun",
    specialty: "Ear, Nose & Throat specialist",
    price: "IDR. 120.000",
    rating: "4.5",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/425d2afb4b4560e70d53b74fb95b1e1193741f155415fb38651bd0d1c70a5c1d?placeholderIfAbsent=true&apiKey=2e39da48f85848aca22cf1d6f6e5c588"
  },
  {
    name: "Dr. Jacky Cun",
    specialty: "Ear, Nose & Throat specialist",
    price: "IDR. 120.000",
    rating: "4.5",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/425d2afb4b4560e70d53b74fb95b1e1193741f155415fb38651bd0d1c70a5c1d?placeholderIfAbsent=true&apiKey=2e39da48f85848aca22cf1d6f6e5c588"
  }
];

const DoctorsScreen: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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
                  value={''}
                />
              </View>
            </View>

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row mt-4 gap-3"
            >
              <FilterButton label="Available Today" />
              <FilterButton label="Gender" />
              <FilterButton label="Price" />
              <FilterButton label="Rating" />
            </ScrollView>
          </View>

          {/* Doctors List */}
          <ScrollView
            className="flex-1 px-4 pt-2"
            showsVerticalScrollIndicator={false}
          >
            {doctorsData.map((doctor, index) => (
              <TouchableOpacity
                key={index}
              // onPress={() => router.push('/doctor-detail')}
              >
                <DoctorCard
                  name={doctor.name}
                  specialty={doctor.specialty}
                  price={doctor.price}
                  rating={doctor.rating}
                  imageUrl={doctor.imageUrl}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DoctorsScreen;