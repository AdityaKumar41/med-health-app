import React from 'react';
import { View, Text } from 'react-native';
import type { FilterButtonProps } from '@/types/type';

export const FilterButton: React.FC<FilterButtonProps> = ({ label }) => {
  return (
    <View className="flex overflow-hidden gap-3 justify-center items-center px-3 py-1.5 bg-gray-50 rounded-lg border border border-solid shadow-sm">
      <View className="self-stretch my-auto">
        <Text>{label}</Text>
      </View>
      <View className="flex shrink-0 self-stretch my-auto w-5 h-5" />
    </View>
  );
};