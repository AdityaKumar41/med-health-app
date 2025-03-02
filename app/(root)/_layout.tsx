import { View } from "react-native";
import React from "react";
import { router, Stack } from "expo-router";
import { useAccount } from "wagmi";


const RootLayout = () => {
  const { isConnected, address, isReconnecting } = useAccount();

  React.useEffect(() => {
    if (isReconnecting && !isConnected) {
      router.replace("/(auth)/welcome");
    }
  }, [isConnected]);


  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default RootLayout;
