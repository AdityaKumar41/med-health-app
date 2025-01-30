import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SearchBar } from '@/components/SearchBar';
import { SpecialtyCard } from '@/components/SpecialtyCard';

export const specialties = [
    {
      emoji: "👂🏻",
      title: "Ear, Nose & Throat",
      description: "Wide selection of doctor's specialties"
    },
    {
      emoji: "🧠",
      title: "Psychiatrist",
      description: "Wide selection of doctor's specialties"
    },
    {
      emoji: "🦷",
      title: "Dentist",
      description: "Wide selection of doctor's specialties"
    },
    {
      emoji: "🤌",
      title: "Dermato-veneorologis",
      description: "Wide selection of doctor's specialties"
    }
  ];

const AppointmentBooking: React.FC = () => {
  return (
    <View className="flex overflow-hidden flex-col pt-11 pb-40 mx-auto w-full bg-white rounded-3xl max-w-[480px]">
      <View className="flex gap-2 justify-center items-center px-4 py-3 text-base font-bold tracking-wide leading-7 text-center bg-white border-b border-gray-100 text-zinc-900">
        <View className="flex shrink-0 self-stretch my-auto w-6 h-6" />
        <View className="flex-1 shrink self-stretch my-auto basis-0">
          <Text>Book an Appointment</Text>
        </View>
        <View className="flex shrink-0 self-stretch my-auto w-6 h-6" />
      </View>
      
      <View className="flex flex-col p-4 w-full">
        <View className="flex flex-col w-full tracking-wide">
          <View className="text-base font-bold leading-7 text-zinc-900">
            <Text>Medical Specialties</Text>
          </View>
          <View className="text-xs font-medium leading-loose text-zinc-700">
            <Text>Wide selection of doctor's specialties</Text>
          </View>
        </View>
        
        <SearchBar placeholder="symptoms, diseases..." />
      </View>

      <View className="flex flex-col py-3 w-full tracking-wide">
        {specialties.map((specialty, index) => (
          <SpecialtyCard
            key={index}
            emoji={specialty.emoji}
            title={specialty.title}
            description={specialty.description}
          />
        ))}
        
        <TouchableOpacity 
          className="flex gap-3 items-start self-start px-4 py-2 mt-1 text-sm font-bold leading-6 text-blue-700"
          accessibilityRole="button"
          accessibilityLabel="See more specialties"
        >
          <Text>See More</Text>
          <View className="flex shrink-0 w-6 h-6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppointmentBooking;