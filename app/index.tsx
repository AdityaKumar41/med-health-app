import { View, Text } from "react-native";
import { Redirect } from "expo-router";

const IndexPage = () => {
  const isSignedIn = true;

  if (isSignedIn) {
    return <Redirect href={"/(root)/(tabs)"} />;
  }

  return <Redirect href={"/(auth)/welcome"} />;
};

export default IndexPage;
