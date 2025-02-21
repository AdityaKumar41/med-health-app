import { View, Text, TextInput, ScrollView, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BannerCard } from "@/components/BannerCard";
import { ServiceCard } from "@/components/ServiceCard";
import { NavItem } from "@/components/NavItem";
import { StatusBar } from "expo-status-bar";
import { images } from "@/constants/image";
import { router, useFocusEffect } from "expo-router";
import { usePatient } from "@/hooks/usePatient";
import { useAccount } from "wagmi";
import { Ionicons } from "@expo/vector-icons";
import AppointmentCard from "@/components/Appointment";
import { useSpecialization } from "@/hooks/useSpecialization";

const services = [
  {
    bgColor: "bg-purple-50",
    title: "Book an Apppointment",
    description: "Find a Doctor or specialist",
    imageUri: images.appointment,
    onPress: () => router.push("/(root)/service"),

  },
  {
    bgColor: "bg-emerald-50",
    title: "Appointment with QR",
    description: "Queuing without the hustle",
    imageUri: images.book,
    onPress: () => router.push("/(root)/appointment"),
  },
  {
    bgColor: "bg-orange-50",
    title: "Request Consultation",
    description: "Talk to specialist",
    imageUri: images.request,
    onPress: () => router.push("/(root)/appointment"),
  },
  {
    bgColor: "bg-red-50",
    title: "Locate a Pharmacy",
    description: "Purchase Medicines",
    imageUri: images.pharmacy,
    onPress: () => router.push("/(root)/appointment"),
  },
];

const navItems = [
  { label: "Home", isActive: true },
  { label: "Calendar" },
  { label: "History" },
  { label: "Chat" },
  { label: "Account" },
];

const banners = [
  {
    bgColor: "bg-blue-700",
    title: "Prevent the spread\nof COVID-19 Virus",
  },
  {
    bgColor: "bg-red-500",
    title: "Prevent the spread\nof COVID-19 Virus",
  },
  {
    bgColor: "bg-green-400",
    title: "Prevent the spread\nof COVID-19 Virus",
  },
];

const Home = () => {
  const { address } = useAccount()
  const { data, refetch } = usePatient(address!);
  const { data: specializationData } = useSpecialization()
  console.log("data", specializationData)
  const firstTimeRef = React.useRef(true)

  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      refetch()
    }, [refetch])
  );

  const isAppointment = false;

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="flex overflow-hidden flex-col pt-5 mx-auto w-full bg-white rounded-3xl max-w-[480px] ">
          <View className="flex flex-col p-4 w-full">
            <View className="flex flex-row gap-10 justify-between items-center w-full">
              <View className="flex flex-col self-stretch my-auto tracking-wide w-[237px]">
                <View className=" font-bold leading-relaxed text-zinc-900">
                  <Text className="font-JakartaBold text-2xl">Hi {data?.name.split(" ")[0]}</Text>
                </View>
                <View className="text-xs font-medium leading-loose text-zinc-700">
                  <Text className="font-Jakarta">
                    May you always in a good condition
                  </Text>
                </View>
              </View>
              <View className="flex overflow-hidden gap-3 justify-center items-center self-stretch p-5 my-auto w-8 h-8 bg-gray-50 rounded-lg border border-solid shadow-sm">
                <Image source={require("@/assets/icon/bell.png")} />
              </View>
            </View>

            <View className="flex gap-2 mt-4 w-full">
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
          </View>
          {isAppointment && (
            <AppointmentCard name="Dr. Stone Gaze" specialty="Ear, Nose & Throat specialist" date="12th Dec 2023, 10.00 PM" image="https://api.dicebear.com/9.x/dylan/jpeg?seed=Alexander" />
          )}
          <View>
            <View className="flex items-center justify-center flex-wrap flex-row gap-4  py-4">
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </View>
          </View>

          <View className="flex gap-4 items-start p-4 tracking-wide text-white">
            {banners.map((banner, index) => (
              <BannerCard key={index} {...banner} />
            ))}
          </View>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView >
  );
};

export default Home;
