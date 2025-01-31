import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useAccount, useDisconnect } from "wagmi";
import { Ionicons } from "@expo/vector-icons";
import { useAppKit } from "@reown/appkit-wagmi-react-native";
import { Button } from "@/components/ui/Button";
import { router } from "expo-router";
import { MenuSectionProps } from "@/types/type";
import { StatusBar } from "expo-status-bar";

const Account = () => {
  const { address, isConnected } = useAccount();
  const {open} = useAppKit()
  if(!address){
    router.replace("/(auth)/welcome");
  }

  const userInfo = {
    name: "Tonald Drump",
    role: "Junior Full Stack Developer",
    email: "Tonald@gmail.com",
    location: "Taman Anggrek",
    memberSince: "2023",
    totalAppointments: 12,
    healthScore: 85,
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header Section */}
      <View className="bg-blue-600 pt-12 pb-24 rounded-b-[40px] shadow-lg">
        <View className="px-4 justify-between items-center w-full">
          <Text className="text-white text-lg font-JakartaBold">My Profile</Text>
        </View>
      </View>
      <View className="px-4 -mt-16">
        <View className="bg-white rounded-3xl p-4 shadow-lg">
          <View className="items-center">
            <Image
              source={{
                uri: "https://cdn.builder.io/api/v1/image/assets/95a3c52e460440f58cf6776b478813ea/d6954879c6447b5b7d4cb004f31f770ede1b0a30c57fa508d0fbb42671a80517",
              }}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
            <Text className="font-JakartaBold text-2xl mt-2">{userInfo.name}</Text>
            {isConnected && (
              <Text className="text-blue-500 text-sm mt-1">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Text>
            )}
          </View>

          {/* Stats Cards */}
          <View className="flex-row justify-between mt-6">
            <StatCard title="Appointments" value={userInfo.totalAppointments} />
            <StatCard title="Health Score" value={`${userInfo.healthScore}%`} />
          </View>
        </View>
      </View>

      {/* Menu Sections */}
      <View className="px-4 mt-6 space-y-6">
        {/* Personal Info Section */}
        <MenuSection
          title="Personal Information"
          items={[
            { icon: "mail", label: "Email", value: userInfo.email },
            { icon: "location", label: "Location", value: userInfo.location },
            { icon: "calendar", label: "Member Since", value: userInfo.memberSince },
          ]}
        />

        {/* Quick Actions */}
        <MenuSection
          title="Quick Actions"
          items={[
            { icon: "document-text", label: "Medical Records" },
            { icon: "calendar", label: "Appointments" },
            { icon: "pulse", label: "Health Tracking" },
          ]}
        />

        {/* Settings */}
        <MenuSection
          title="Settings"
          items={[
            { icon: "settings", label: "Account Settings" },
            { icon: "shield-checkmark", label: "Privacy" },
            { icon: "help-circle", label: "Help & Support" },
          ]}
        />

        {/* Wallet Connection */}
        <View className="pb-6">
          <Button text="Wallet Info !" onClick={open}/>
        </View>
      </View>
      <StatusBar style="light" />
    </ScrollView>
  );
};

const StatCard = ({ title, value }: {title: String, value: number | string}) => (
  <View className="bg-gray-50 p-4 rounded-xl w-[48%]">
    <Text className="text-gray-500 text-sm font-JakartaMedium ">{title}</Text>
    <Text className="text-xl font-JakartaBold text-gray-800 ">{value}</Text>
  </View>
);

const MenuSection = ({ title, items }: MenuSectionProps) => (
  <View className="p-2">
    <Text className="text-lg font-JakartaBold mb-3 text-gray-800">{title}</Text>
    <View className="bg-white rounded-xl overflow-hidden shadow-sm">
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          className={`flex-row items-center p-4 ${
            index < items.length - 1 ? "border-b border-gray-100" : ""
          }`}
        >
          <Ionicons name={item.icon} size={22} color="#4B5563" />
          <View className="flex-1 ml-3">
            <Text className="text-gray-800 font-Jakarta text-base">{item.label}</Text>
            {item.value && (
              <Text className="text-gray-500 text-sm">{item.value}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default Account;
