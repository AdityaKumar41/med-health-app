import { SpecialtyCard } from "@/components/SpecialtyCard";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { useSpecialization } from "@/hooks/useSpecialization";
import { SpecialityProps } from "@/types/type";

const AppointmentBooking: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { data, error } = useSpecialization();
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const filteredSpecialties = React.useMemo(() => {
    return data.filter((specialty: SpecialityProps) =>
      specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialty.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Header with back button */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-JakartaBold text-center mr-8">
            Book an Appointment
          </Text>
        </View>

        <ScrollView className="flex-1">
          <View className="flex-1 p-4">
            {/* Title Section */}
            <View className="py-6">
              <Text className="font-JakartaBold text-2xl text-zinc-900 pb-1">
                Medical Specialties
              </Text>
              <Text className="font-Jakarta text-base text-zinc-900">
                Wide selection of doctor's specialties
              </Text>
            </View>

            {/* Search Section */}
            <View className="flex-row gap-2 h-16">
              <View className="flex-1 h-full p-2 bg-white rounded-xl border border-gray-300">
                <TextInput
                  className="h-full w-full"
                  placeholder="Search Specialties!"
                  aria-label="Search symptoms or diseases"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity className="w-16 h-16 justify-center items-center bg-[#F9F5FF] rounded-xl border border-gray-300">
                <Image source={require("@/assets/icon/fillter.png")} />
              </TouchableOpacity>
            </View>

            {/* Specialties List */}
            <View className="py-3">
              {filteredSpecialties.map((specialty: SpecialityProps, index: number) => (
                <SpecialtyCard
                  key={index}
                  emoji={specialty.icon}
                  title={specialty.name}
                  description={specialty.description}
                  onPress={() => router.push({ pathname: "/(root)/appointment", params: { id: specialty.id } })}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AppointmentBooking;