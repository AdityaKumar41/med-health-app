import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SearchBar } from '@/components/SearchBar';
import { FilterButton } from '@/components/ui/FilterButton';
import { DoctorCard } from '@/components/DoctorCard';
import InputField from '@/components/InputField';

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
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-6 border-b border-gray-100">
        <Text className="text-xl font-semibold text-zinc-900">Find Doctors</Text>
        <Text className="text-sm text-gray-500 mt-1">Book appointments with top specialists</Text>
      </View>

      {/* Search and Filter Section */}
      <View className="p-4">
        <View className="flex-1 flex-row items-center align-middle space-x-3">
          <View>
            <InputField
              placeholder="Search doctors, specialties..."
              className="bg-gray-50 h-14"
            />
          </View>
          <TouchableOpacity
            className="flex items-center justify-center w-12 h-12 bg-[#F9F5FF] rounded-xl"
          >
            <Image
              source={require("@/assets/icon/fillter.png")}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View className="mt-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ gap: 8 }}
          >
            <FilterButton label="Available Today" />
            <FilterButton label="Gender" />
            <FilterButton label="Price" />
            <FilterButton label="Rating" />
          </ScrollView>
        </View>
      </View>

      {/* Doctors List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {doctorsData.map((doctor, index) => (
          <View key={index} className="mb-4 last:mb-0">
            <DoctorCard
              name={doctor.name}
              specialty={doctor.specialty}
              price={doctor.price}
              rating={doctor.rating}
              imageUrl={doctor.imageUrl}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default DoctorsScreen;