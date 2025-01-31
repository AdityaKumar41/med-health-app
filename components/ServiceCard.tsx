import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import type { ServiceCardProps } from "@/types/index";
import { Link } from "expo-router";

export const ServiceCard: React.FC<ServiceCardProps> = ({
  bgColor,
  title,
  description,
  imageUri,
  customIcon,
  onPress,
}) => {
  return (
    <TouchableOpacity
      className={`flex flex-col self-stretch p-4 my-auto ${bgColor} rounded-xl w-[175px] h-fit`} onPress={onPress} >
    
      {customIcon ? (
        <View className="flex bg-red-100 rounded-lg border border-orange-200 border-solid h-[42px] min-h-[42px] w-[42px]" />
      ) : (
        <Image
          source={imageUri}
          className="object-contain rounded-lg aspect-square w-[42px]"
        />
      )}
      <View className="flex flex-col mt-3 w-full">
        <View className="text-2xl font-bold leading-7 text-zinc-900">
          <Text className="font-JakartaExtraBold text-xl">{title}</Text>
        </View>
        <View className="text-xs font-medium leading-5 text-zinc-500">
          <Text className="font-Jakarta">{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
