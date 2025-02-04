import { SpecialtyCard } from "@/components/SpecialtyCard";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
// import { SpecialtyCard } from "./SpecialtyCard";
// import { SearchBar } from "./SearchBar";

const specialties = [
  {
    emoji: "👂🏻",
    title: "Ear, Nose & Throat",
    description: "Wide selection of doctor's specialties",
  },
  {
    emoji: "🧠",
    title: "Psychiatrist",
    description: "Wide selection of doctor's specialties",
  },
  {
    emoji: "🦷",
    title: "Dentist",
    description: "Wide selection of doctor's specialties",
  },
  {
    emoji: "🤌",
    title: "Dermato-veneorologis",
    description: "Wide selection of doctor's specialties",
  },
];


const AppointmentBooking: React.FC = () => {
  return (
    <ScrollView className="bg-white">
      <View className="flex overflow-hidden flex-col mx-auto p-2 w-full  ">
        {/* <View className="flex gap-2 justify-center items-center px-4 py-3 text-base font-bold tracking-wide leading-7 text-center bg-white border-b border-gray-100 text-zinc-900">
          <View className="flex shrink-0 self-stretch my-auto w-6 h-6" />
          <View className="flex-1 shrink self-stretch my-auto basis-0">
            <Text className="font-JakartaBold text-xl">Book an Appointment</Text>
          </View>
          <View className="flex shrink-0 self-stretch my-auto w-6 h-6" />
        </View> */}

        <View className="flex flex-col p-4 w-screen">
          <View className="flex flex-col w-full tracking-wide ">
            <View className="text-base font-bold pb-2 text-zinc-900">
              <Text className="font-JakartaBold text-xl">Medical Specialties</Text>
            </View>
            <View className="text-xs font-medium leading-loose text-zinc-700">
              <Text className="font-Jakarta text-zinc-900">Wide selection of doctor's specialties</Text>
            </View>
          </View>
          <View className="flex flex-row gap-2 h-16 text-sm font-medium items-center min-w-[240px] w-full text-zinc-500">
            <View className="flex-1 h-full p-2 bg-white rounded-xl border border-gray-300 border-solid">
              {/* <View className="flex shrink-0 w-6 h-6" /> */}
              <TextInput
                className="h-full w-full"
                placeholder="Search Doctor !"
                aria-label="Search symptoms or diseases"
              />
            </View>
            <View className="flex gap-3 justify-center items-center p-2 w-16 h-16 border-gray-300 bg-[#F9F5FF] rounded-xl">
              <Image source={require("@/assets/icon/fillter.png")} />
            </View>
          </View>
        </View>

        <View className="flex flex-col py-3 w-full tracking-wide">
          {specialties.map((specialty, index) => (
            <SpecialtyCard
              key={index}
              emoji={specialty.emoji}
              title={specialty.title}
              description={specialty.description}
            />
          ))}

          <TouchableOpacity
            className="flex flex-row  gap-3 items-center self-start px-4 py-2 mt-1"
            accessibilityRole="button"
            accessibilityLabel="See more specialties"
          >
            <View>
              <Text className="text-base font-bold leading-6 text-blue-700">
                See More
              </Text>
            </View>
            <Ionicons name="chevron-forward" className="leading-6" size={16} color="blue" />
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>

  );
};

export default AppointmentBooking;