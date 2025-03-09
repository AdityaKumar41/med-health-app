import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useAccount, useDisconnect } from "wagmi";
import { Ionicons } from "@expo/vector-icons";
import { useAppKit } from "@reown/appkit-wagmi-react-native";
import { Button } from "@/components/ui/Button";
import { router } from "expo-router";
import { MenuSectionProps } from "@/types/type";
import { StatusBar } from "expo-status-bar";
import { usePatient, usePatientUpdate } from "@/hooks/usePatient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import { useSignedUrl } from "@/hooks/useAws";

const Account = () => {
  const { address, isConnected } = useAccount();
  const { data } = usePatient(address!);
  const { open } = useAppKit();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Track profile data in state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    age: "",
    profile_picture: ""
  });

  // Get signed URL mutation
  const { mutateAsync: getSignedUrl } = useSignedUrl(address!);

  // Set initial data when available
  useEffect(() => {
    if (data) {
      setProfileData({
        name: data.name || "",
        email: data.email || "",
        age: data.age?.toString() || "",
        profile_picture: data.profile_picture || "https://cdn.builder.io/api/v1/image/assets/95a3c52e460440f58cf6776b478813ea/d6954879c6447b5b7d4cb004f31f770ede1b0a30c57fa508d0fbb42671a80517"
      });
    }
  }, [data]);

  const { mutate, isPending: isSaving } = usePatientUpdate(address!);

  // Modified pickImage function to upload to AWS S3
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedImage = result.assets[0];

      // Start upload process
      setIsUploadingImage(true);

      // Extract file info
      const fileName = selectedImage.uri.split('/').pop() || `image_${Date.now()}.jpg`;
      const fileType = selectedImage.mimeType || 'image/jpeg';

      try {
        // Get the signed URL from AWS
        const { url, key } = await getSignedUrl({
          filename: fileName,
          filetype: fileType
        });

        console.log('Got signed URL:', url);

        // Upload to S3
        const uploadResult = await FileSystem.uploadAsync(url, selectedImage.uri, {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'Content-Type': fileType,
          }
        });

        console.log('Upload result:', uploadResult);

        if (uploadResult.status !== 200) {
          throw new Error('Failed to upload image to S3');
        }

        // Construct the final S3 URL for storage
        const s3ImageUrl = `${process.env.EXPO_PUBLIC_AWS_S3_URL}/${key}`;
        console.log('S3 image URL:', s3ImageUrl);

        // Update profile data with the S3 URL
        setProfileData(prev => ({
          ...prev,
          profile_picture: s3ImageUrl
        }));

        setIsUploadingImage(false);

      } catch (error) {
        console.error('Error uploading image:', error);
        setIsUploadingImage(false);
        Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      const formattedData = {
        ...profileData,
        age: parseInt(profileData.age, 10),
        wallet_address: address || "",
        blood_group: data?.blood_group || ""  // Keep blood group unchanged
      };

      mutate(formattedData as any, {
        onSuccess: () => {
          Alert.alert("Success", "Profile updated successfully!");
          setIsEditing(false);
        },
        onError: (error) => {
          console.error("Update failed:", error);
          Alert.alert("Error", "Failed to update profile. Please try again.");
        }
      });
    } else {
      // Just toggle editing mode
      setIsEditing(true);
    }
  };

  const updateField = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!address) {
    router.replace("/(auth)/welcome");
  }

  const userInfo = {
    totalAppointments: data?.appointments?.length || 0,
    totalReports: data?.reports?.length || 0,
    age: profileData.age,
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
            disabled={isSaving || isUploadingImage}
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
                onPress={isEditing && !isUploadingImage ? pickImage : undefined}
                className="relative"
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <View className="w-24 h-24 rounded-full border-4 border-white shadow-sm bg-gray-100 justify-center items-center">
                    <ActivityIndicator size="small" color="#0066CC" />
                  </View>
                ) : (
                  <Image
                    source={{ uri: profileData.profile_picture }}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-sm"
                  />
                )}
                {isEditing && !isUploadingImage && (
                  <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {isEditing ? (
                <TextInput
                  value={profileData.name}
                  onChangeText={(value) => updateField("name", value)}
                  className="font-JakartaBold text-2xl mt-2 text-center border-b border-gray-300 p-1"
                />
              ) : (
                <Text className="font-JakartaBold text-2xl mt-2">{profileData.name}</Text>
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
              {
                icon: "person",
                label: "Age",
                value: profileData.age,
                editable: true
              },
              {
                icon: "mail",
                label: "Email",
                value: profileData.email,
                editable: true
              },
              {
                icon: "water-outline",
                label: "Blood Group",
                value: data?.blood_group,
                editable: false // Blood group is not editable
              },
            ]}
            isEditing={isEditing}
            onValueChange={(label, value) => {
              if (label === "Age") updateField("age", value);
              if (label === "Email") updateField("email", value);
              // Blood group changes are ignored
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

      {/* Loading indicator */}
      {(isSaving || isUploadingImage) && (
        <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <View className="bg-white p-4 rounded-lg">
            <ActivityIndicator size="small" color="#0066cc" />
            <Text className="text-gray-800 mt-2">
              {isUploadingImage ? "Uploading image..." : "Saving changes..."}
            </Text>
          </View>
        </View>
      )}
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
          className={`flex-row items-center p-4 ${index < items.length - 1 ? "border-b border-gray-100" : ""}`}
        >
          <Ionicons name={item.icon} size={22} color="#4B5563" />
          <View className="flex-1 ml-3">
            {isEditing && item.value && item.editable !== false ? (
              <TextInput
                className="text-gray-800 font-Jakarta text-base p-1 border-b border-gray-300"
                defaultValue={item.value.toString()}
                onChangeText={(text) => onValueChange?.(item.label, text)}
                keyboardType={item.label === "Age" ? "number-pad" : "default"}
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
          {isEditing && item.value && item.editable !== false && (
            <Ionicons name="create-outline" size={20} color="#4B5563" />
          )}
        </View>
      ))}
    </View>
  </View>
);

export default Account;
