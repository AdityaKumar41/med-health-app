import React from "react";
import { View, Text } from "react-native";
import type { NavItemProps } from "../types";

export const NavItem: React.FC<NavItemProps> = ({ label, isActive }) => {
  return (
    <View
      className={`flex flex-col flex-1 shrink items-center px-5 py-2 ${
        isActive ? "font-bold text-blue-700" : ""
      } basis-0`}
    >
      <View className="flex w-6 min-h-[24px]" />
      <View className="mt-1">
        <Text>{label}</Text>
      </View>
    </View>
  );
};
