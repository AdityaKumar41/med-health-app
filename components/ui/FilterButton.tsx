import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface FilterButtonProps {
  label: string;
  isActive?: boolean;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive = false }) => {
  return (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full border ${
        isActive 
          ? 'bg-[#F9F5FF] border-[#7F56D9]' 
          : 'bg-white border-gray-200'
      }`}
    >
      <Text 
        className={`text-sm font-medium ${
          isActive ? 'text-[#7F56D9]' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};