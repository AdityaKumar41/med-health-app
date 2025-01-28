import { View, Text } from "react-native";
import React from "react";
import { AppKit, AppKitButton } from "@reown/appkit-ethers5-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const history = () => {
  return (
    <SafeAreaView>
      <View className="items-center justify-center my-auto h-full">
        <AppKitButton />
        <AppKit />
      </View>
    </SafeAreaView>
  );
};

export default history;
