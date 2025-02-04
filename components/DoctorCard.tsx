import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { DoctorProps } from '@/types/type';
import { Ionicons } from '@expo/vector-icons';

export const DoctorCard: React.FC<DoctorProps> = ({ name, specialty, price, rating, imageUrl }) => {
  return (
    <TouchableOpacity className="flex flex-row gap-3 items-start p-4 w-full">
      <Image
        source={{ uri: imageUrl }}
        className="object-contain shrink-0 w-12 rounded-2xl aspect-square"
        accessibilityLabel={`Profile picture of ${name}`}
      />
      <View className="flex flex-col flex-1 shrink text-base font-bold tracking-wide leading-7 basis-0 text-zinc-900">
        <View>
          <Text className='font-JakartaBold text-base'>{name}</Text>
        </View>
        <View className="text-xs font-medium leading-loose text-zinc-500">
          <Text className='font-Jakarta text-base'>{specialty}</Text>
        </View>
        <View className="flex-1 shrink gap-1 self-stretch w-full">
          <Text className='font-Jakarta text-base'>{price}</Text>
        </View>
      </View>
      <View className="flex gap-2 items-start">
        <View className="flex items-start w-5">
          <View className="flex w-5 min-h-[20px]" />
        </View>
        <View className="text-xs flex-row items-center gap-3 font-medium tracking-wide leading-loose text-zinc-500">
          <Text>{rating}</Text>
          <Ionicons name='star' />
        </View>
      </View>
    </TouchableOpacity>
  );
};