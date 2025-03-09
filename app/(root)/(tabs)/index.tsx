import { View, Text, TextInput, ScrollView, Image, ActivityIndicator, TouchableOpacity, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BannerCard } from "@/components/BannerCard";
import { ServiceCard } from "@/components/ServiceCard";
import { StatusBar } from "expo-status-bar";
import { images } from "@/constants/image";
import { router, useFocusEffect } from "expo-router";
import { usePatient } from "@/hooks/usePatient";
import { useAccount } from "wagmi";
import AppointmentCard from "@/components/Appointment";
import { useSpecialization } from "@/hooks/useSpecialization";
import { useAppointment, useAppointmentPending } from "@/hooks/useAppointment";
import AppointmentTicketModal from "@/components/AppointmentTicketModal";
import { useSearchDoctor } from "@/hooks/useDoctor";
import { Ionicons } from "@expo/vector-icons";

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
    onPress: () => router.push("/(root)/ticket"),
  },
  {
    bgColor: "bg-orange-50",
    title: "Request Consultation",
    description: "Talk to specialist",
    imageUri: images.request,
    onPress: () => router.push("/(root)/doctor"),
  },
  {
    bgColor: "bg-red-50",
    title: "Locate a Pharmacy",
    description: "Purchase Medicines",
    imageUri: images.pharmacy,
    onPress: () => router.push("/(root)/pharmacy"),
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
  const { data, refetch, isFetching } = usePatient(address!);
  const { data: specializationData } = useSpecialization()
  const firstTimeRef = React.useRef(true)
  const [searchQuery, setSearchQuery] = useState("");
  const [initialFetch, setInitialFetch] = useState(true);
  const { data: appointmentData, isFetching: isFetchingAppointments } = useAppointmentPending(address!);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Use the search doctor hook
  const { data: searchResults, isLoading: isSearching } = useSearchDoctor(searchQuery);

  useEffect(() => {
    if (!isFetching) {
      setInitialFetch(false);
    }
  }, [isFetching]);

  // Toggle search results visibility based on query
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      refetch()
    }, [refetch])
  );

  // Handle doctor selection
  const handleSelectDoctor = (doctor: any) => {
    router.push({
      pathname: "/(root)/doctor-profile",
      params: { id: doctor.id }
    });
    setSearchQuery("");
    setShowSearchResults(false);
  };

  return (
    <SafeAreaView className="flex-1">
      {isFetching && initialFetch ? (
        <View className="flex-1 justify-center items-center bg-white opacity-75">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-lg text-gray-700">Loading...</Text>
        </View>
      ) : (
        <>
          <View className="flex overflow-hidden flex-col pt-5 mx-auto w-full bg-white rounded-3xl max-w-[480px]">
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

              <View className="flex gap-2 mt-4 w-full relative">
                <View className="flex flex-row gap-2 h-16 text-sm font-medium items-center min-w-[240px] w-full text-zinc-500">
                  <View className="flex-1 h-full p-2 bg-white rounded-xl border border-gray-300 border-solid relative">
                    <TextInput
                      className="h-full w-full pl-2 pr-8"
                      placeholder="Search Doctor by name..."
                      aria-label="Search doctor by name"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onPress={() => setSearchQuery("")}
                      >
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View className="flex gap-3 justify-center items-center p-2 w-16 h-16 border-gray-300 bg-[#F9F5FF] rounded-xl">
                    <Image source={require("@/assets/icon/fillter.png")} />
                  </View>
                </View>
              </View>
            </View>

            {/* Search Results Panel */}
            {showSearchResults && (
              <View className="px-4 mb-4">
                <View className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
                  {isSearching ? (
                    <View className="p-4 flex items-center justify-center">
                      <ActivityIndicator size="small" color="#0066CC" />
                      <Text className="text-gray-500 mt-2">Searching doctors...</Text>
                    </View>
                  ) : searchResults?.data?.length > 0 ? (
                    <FlatList
                      data={searchResults.data}
                      keyExtractor={(item) => item.id}
                      maxToRenderPerBatch={5}
                      className="max-h-[300px]"
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          className="p-3 border-b border-gray-100 flex-row items-center"
                          onPress={() => handleSelectDoctor(item)}
                        >
                          {item.profile_picture ? (
                            <Image
                              source={{ uri: item.profile_picture }}
                              className="w-12 h-12 rounded-full mr-3"
                            />
                          ) : (
                            <View className="w-12 h-12 rounded-full bg-blue-100 mr-3 items-center justify-center">
                              <Text className="text-blue-500 font-bold">
                                {item.name?.charAt(0) || "D"}
                              </Text>
                            </View>
                          )}
                          <View className="flex-1">
                            <Text className="font-JakartaBold text-gray-800">{item.name}</Text>
                            <Text className="font-Jakarta text-xs text-gray-500">
                              {item.specialties ?
                                item.specialties.map((s: any) => s.name).join(", ") :
                                `Experience: ${item.experience || 0} years`
                              }
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <View className="p-4 items-center">
                          <Text className="text-gray-500">No doctors found</Text>
                        </View>
                      }
                    />
                  ) : searchQuery.length >= 2 ? (
                    <View className="p-4 items-center">
                      <Text className="text-gray-500">No doctors found matching "{searchQuery}"</Text>
                    </View>
                  ) : (
                    <View className="p-4 items-center">
                      <Text className="text-gray-500">Type at least 2 characters to search</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <ScrollView>
              {appointmentData?.data.map((appointment: any) => (
                <AppointmentCard
                  key={appointment.id}
                  name={appointment.doctor.name}
                  specialty={appointment.doctor.specialist?.map((specialist: any) => specializationData?.data.find((data: any) => data.id === specialist).name).join(", ")}
                  date={appointment.date}
                  image={appointment.doctor.profile_picture}
                  onPress={() => setSelectedAppointment(appointment)}
                  ticket={appointment.ticket}
                />
              ))}

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
            </ScrollView>
          </View>
        </>
      )}
      <AppointmentTicketModal
        visible={!!selectedAppointment}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
      <StatusBar style="dark" />
    </SafeAreaView >
  );
};

export default Home;
