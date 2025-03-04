import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DoctorCardProps {
  name: string;
  specialty: string;
  price: number;
  rating: string;
  imageUrl: string;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  name,
  specialty,
  price,
  rating,
  imageUrl,
}) => {
  return (
    <View className="flex-row p-4 mb-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <Image
        source={{ uri: imageUrl }}
        className="w-20 h-20 rounded-lg"
        defaultSource={{ uri: `https://api.dicebear.com/9.x/dylan/jpeg?seed=${name}` }}
      />
      <View className="flex-1 ml-3 justify-center">
        <Text className="text-lg font-JakartaBold text-gray-900">{name}</Text>
        <Text className="text-gray-500 font-JakartaRegular">{specialty}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="star" size={16} color="#FFB800" />
          <Text className="ml-1 text-gray-500 font-JakartaRegular">{rating}</Text>
        </View>
      </View>
      <View className="justify-center items-end">
        <Text className="text-primary font-JakartaBold">POL {price}</Text>
        <Text className="text-xs text-gray-400">Consultation Fee</Text>
      </View>
    </View>
  );
};