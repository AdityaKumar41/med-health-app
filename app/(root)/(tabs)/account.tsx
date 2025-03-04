import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useAccount, useDisconnect } from "wagmi";
import { Ionicons } from "@expo/vector-icons";
import { useAppKit } from "@reown/appkit-wagmi-react-native";
import { Button } from "@/components/ui/Button";
import { router } from "expo-router";
import { MenuSectionProps } from "@/types/type";
import { StatusBar } from "expo-status-bar";
import { usePatient } from "@/hooks/usePatient";
import { SafeAreaView } from "react-native-safe-area-context";

const Account = () => {
  const { address, isConnected } = useAccount();
  const { data } = usePatient(address!);
  const { open } = useAppKit();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(data?.name || "xyz");
  const [age, setAge] = useState(data?.age || "00");
  const [profileImage, setProfileImage] = useState(data?.profile_picture || "https://cdn.builder.io/api/v1/image/assets/95a3c52e460440f58cf6776b478813ea/d6954879c6447b5b7d4cb004f31f770ede1b0a30c57fa508d0fbb42671a80517");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Save changes logic here
      Alert.alert("Success", "Profile updated successfully!");
    }
  };

  if (!address) {
    router.replace("/(auth)/welcome");
  }

  const userInfo = {
    totalAppointments: data?.appointments?.length || 0,
    totalReports: data?.reports?.length || 0,
    age: age,
  };

  const handleOnPress = () => {
    router.push({ pathname: "/(root)/report-viewer", params: { reports: data?.reports } });
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white px-4 pt-6 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-JakartaBold text-gray-900">My Profile</Text>
          <TouchableOpacity
            onPress={handleEditToggle}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Ionicons
              name={isEditing ? "checkmark" : "create-outline"}
              size={24}
              color="#374151"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 bg-gray-50">
        {/* Profile Card */}
        <View className="px-4 mt-4">
          <View className="bg-white rounded-3xl p-4 shadow-sm">
            <View className="items-center">
              <TouchableOpacity
                onPress={isEditing ? pickImage : undefined}
                className="relative"
              >
                <Image
                  source={{ uri: profileImage }}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-sm"
                />
                {isEditing && (
                  <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {isEditing ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="font-JakartaBold text-2xl mt-2 text-center border-b border-gray-300 p-1"
                />
              ) : (
                <Text className="font-JakartaBold text-2xl mt-2">{name}</Text>
              )}

              {isConnected && (
                <Text className="text-blue-500 text-sm mt-1">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Text>
              )}
            </View>

            {/* Stats Cards */}
            <View className="flex-row justify-between mt-6">
              <StatCard title="Appointments" value={userInfo.totalAppointments} />
              <StatCard title="Reports" value={userInfo.totalReports} onPress={handleOnPress} />
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="px-4 mt-6 space-y-6">
          {/* Personal Info Section */}
          <MenuSection
            title="Personal Information"
            items={[
              { icon: "person", label: "Age", value: data?.age },
              { icon: "mail", label: "Email", value: data?.email },
              { icon: "water-outline", label: "Blood Group", value: data?.blood_group },
            ]}
            isEditing={isEditing}
            onValueChange={(label, value) => {
              if (label === "Age") setAge(value);
            }}
          />

          {/* Settings */}
          <MenuSection
            title="Settings"
            items={[
              { icon: "settings", label: "Account Settings" },
              { icon: "shield-checkmark", label: "Privacy" },
              { icon: "help-circle", label: "Help & Support" },
            ]}
            isEditing={false} // Always false as these are navigation items
          />

          {/* Wallet Connection */}
          <View className="pb-6">
            <Button text="Wallet Info !" onClick={open} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ title, value, onPress }: { title: String, value: number | string, onPress?: () => void }) => (
  <TouchableOpacity className="bg-gray-50 p-4 rounded-xl w-[48%]" onPress={onPress}>
    <Text className="text-gray-500 text-sm font-JakartaMedium ">{title}</Text>
    <Text className="text-xl font-JakartaBold text-gray-800 ">{value}</Text>
  </TouchableOpacity>
);

const MenuSection = ({ title, items, isEditing, onValueChange }: MenuSectionProps & {
  isEditing?: boolean;
  onValueChange?: (label: string, value: string) => void;
}) => (
  <View className="p-2">
    <Text className="text-lg font-JakartaBold mb-3 text-gray-800">{title}</Text>
    <View className="bg-white rounded-xl overflow-hidden shadow-sm">
      {items.map((item, index) => (
        <View
          key={index}
          className={`flex-row items-center p-4 ${index < items.length - 1 ? "border-b border-gray-100" : ""
            }`}
        >
          <Ionicons name={item.icon} size={22} color="#4B5563" />
          <View className="flex-1 ml-3">
            {isEditing && item.value ? (
              <TextInput
                className="text-gray-800 font-Jakarta text-base p-1 border-b border-gray-300"
                defaultValue={item.value.toString()}
                onChangeText={(text) => onValueChange?.(item.label, text)}
              />
            ) : (
              <>
                <Text className="text-gray-800 font-Jakarta text-base">{item.label}</Text>
                {item.value && (
                  <Text className="text-gray-500 text-sm">{item.value}</Text>
                )}
              </>
            )}
          </View>
          {isEditing && item.value && (
            <Ionicons name="create-outline" size={20} color="#4B5563" />
          )}
        </View>
      ))}
    </View>
  </View>
);

export default Account;
