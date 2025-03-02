import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useNetInfo } from "@react-native-community/netinfo";
import { OfflinePage } from "@/components/OfflinePage";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
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
  AppKitButton,
} from "@reown/appkit-wagmi-react-native";
import { ChatProvider } from "@/context/useChatProvider";
import { NetworkProvider } from '@/context/NetworkContext';

const queryClient = new QueryClient();

// 1. Get projectId at https://cloud.reown.com
const projectId = process.env.EXPO_PUBLIC_PROJECT_ID!;

// 2. Create config
const metadata = {
  name: "AppKit RN",
  description: "AppKit RN Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
    universal: "YOUR_APP_UNIVERSAL_LINK.com",
  },
};

const chains = [polygonAmoy, polygonZkEvmTestnet] as const;

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createAppKit({
  projectId,
  wagmiConfig,
  defaultChain: polygonAmoy, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function RootLayout() {
  const { isConnected } = useNetInfo();
  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  if (!isConnected) {
    return <OfflinePage onRetry={() => null} />;
  }

  return (
    <NetworkProvider>
      <ThemeProvider value={DefaultTheme}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <ChatProvider >
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
