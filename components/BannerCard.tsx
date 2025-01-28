import React from "react";
import { View, Text } from "react-native";
import type { BannerCardProps } from "../types";

export const BannerCard: React.FC<BannerCardProps> = ({ bgColor, title }) => {
  return (
    <View
      className={`flex overflow-hidden relative gap-6 items-start p-5 ${bgColor} rounded-xl min-w-[240px] w-full justify-center  `}
    >
      <View className="flex z-0 flex-col">
        <View className="text-sm font-bold leading-6">
          <Text className="font-JakartaSemiBold text-white text-lg">
            {title}
          </Text>
        </View>
        <View className="mt-1 text-xs font-medium leading-loose">
          <Text className="font-Jakarta text-white text-base">
            Find out now →{" "}
          </Text>
        </View>
      </View>
    </View>
  );
};
