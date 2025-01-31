import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SearchBar } from '@/components/SearchBar';
import { FilterButton } from '@/components/ui/FilterButton';
import { DoctorCard } from '@/components/DoctorCard';

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
    }
  ];

const DoctorsScreen: React.FC = () => {
  return (
    <View className="flex overflow-hidden flex-col py-10 mx-auto w-full bg-white rounded-3xl max-w-[480px]">
      <View className="flex gap-2 justify-center items-center px-4 py-3 text-base font-bold tracking-wide leading-7 text-center bg-white border-b border-gray-100 text-zinc-900">
        <View className="flex shrink-0 self-stretch my-auto w-6 h-6" />
        <View className="flex-1 shrink self-stretch my-auto basis-0">
          <Text>Ear, Nose & Throat</Text>
        </View>
        <View className="flex shrink-0 self-stretch my-auto w-6 h-6" />
      </View>
      
      <View className="flex flex-col p-4 w-full">
        <SearchBar placeholder="Search Doctor" />
        <View className="flex gap-4 items-start mt-3 w-full text-xs font-bold tracking-wide leading-loose text-zinc-900">
          <FilterButton label="Available Today" />
          <FilterButton label="Gender" />
          <FilterButton label="Price" />
        </View>
      </View>

      <ScrollView className="flex flex-col w-full">
        {doctorsData.map((doctor, index) => (
          <DoctorCard
            key={index}
            name={doctor.name}
            specialty={doctor.specialty}
            price={doctor.price}
            rating={doctor.rating}
            imageUrl={doctor.imageUrl}
          />
        ))}
      </ScrollView>
    </View>
  );
};


export default DoctorsScreen;