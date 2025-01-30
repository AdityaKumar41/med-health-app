import * as React from "react";
import { View, Text } from "react-native";

import { SpecialtyCardProps } from "@/types/index";

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  emoji,
  title,
  description,
}) => {
  return (
    <View className="flex gap-3 items-center p-4 mt-1 w-full">
      <View className="overflow-hidden self-stretch px-3 my-auto text-3xl font-bold leading-none text-black whitespace-nowrap bg-purple-50 border border-indigo-200 border-solid h-[52px] rounded-[99px] w-[52px]">
        <Text>{emoji}</Text>
      </View>
      <View className="flex flex-col flex-1 shrink self-stretch my-auto basis-6 min-w-[240px]">
        <View className="text-base font-bold leading-7 text-zinc-900">
          <Text>{title}</Text>
        </View>
        <View className="mt-1 text-xs font-medium leading-loose text-zinc-500">
          <Text>{description}</Text>
        </View>
      </View>
      <View className="flex shrink-0 self-stretch my-auto w-6 h-6" />
    </View>
  );
};
