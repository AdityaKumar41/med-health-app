import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const history = () => {
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
