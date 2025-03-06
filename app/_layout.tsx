import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useNetInfo } from "@react-native-community/netinfo";
import { OfflinePage } from "@/components/OfflinePage";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import "@walletconnect/react-native-compat";
import { WagmiProvider } from "wagmi";
import { polygonAmoy, polygonZkEvmTestnet } from "@wagmi/core/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createAppKit,
  defaultWagmiConfig,
  AppKit,
} from "@reown/appkit-wagmi-react-native";
import { ChatProvider } from "@/context/useChatProvider";
import { NetworkProvider } from '@/context/NetworkContext';
import { View } from "react-native";

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// 1. Get projectId at https://cloud.reown.com
const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || "a37c22a042ab0cbeac0bf435048b4f74";

// 2. Create config
const metadata = {
  name: "Med Health",
  description: "Med Health is a decentralized health platform.",
  url: "https://www.adityam.live/projects/med-health-app",
  icons: ["https://avatars.githubusercontent.com/u/119885098"],
  redirect: {
    native: "medhealth://",
    universal: "https://medhealth.example.com",
  },
};

const chains = [polygonAmoy, polygonZkEvmTestnet] as const;

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: false, // Important for React Native
});

// 3. Create modal
createAppKit({
  projectId,
  wagmiConfig,
  defaultChain: polygonAmoy,
  enableAnalytics: true,
});

// Create query client
const queryClient = new QueryClient();

export default function RootLayout() {
  const { isConnected } = useNetInfo();

  const [fontsLoaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Still loading fonts
  }

  if (!isConnected) {
    return <OfflinePage onRetry={() => null} />;
  }

  return (
    <NetworkProvider>
      <ThemeProvider value={DefaultTheme}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <ChatProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(root)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <AppKit />
              <StatusBar style="dark" />
            </ChatProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </NetworkProvider>
  );
}
