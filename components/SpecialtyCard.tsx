import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { SpecialtyCardProps } from "@/types/index";
import { Ionicons } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  emoji,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity className="flex flex-row gap-3 items-center p-4 mt-1 w-full" onPress={onPress}>
      <View className="flex items-center justify-center overflow-hidden self-stretch px-3 text-3xl font-bold leading-none text-black bg-purple-50 border border-indigo-200 border-solid h-[52px] rounded-[99px] w-[52px]">
        <SvgUri uri={emoji || null} />
      </View>
      <View className="flex flex-col flex-1 shrink self-stretch my-auto basis-6 min-w-[240px]">
        <View className="text-base font-bold leading-7 text-zinc-900">
          <Text className="text-base font-JakartaBold">{title}</Text>
        </View>
        <View className="mt-1 text-xs font-medium leading-loose text-zinc-500">
          <Text className="font-Jakarta">{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="black" />
    </TouchableOpacity>
  );
};
