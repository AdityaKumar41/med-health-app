import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAccount } from "wagmi";
import { usePatient } from "@/hooks/usePatient";

const history = () => {

  const { address } = useAccount();
  const { data } = usePatient(address!);
  console.log(data);

  return (
    <SafeAreaView>
      <View className="items-center justify-center my-auto h-full">
        <Text>Hii</Text>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default history;
