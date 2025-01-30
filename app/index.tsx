import { View, Text } from "react-native";
import React from "react";
import { Redirect } from "expo-router";

const IndexPage = () => {
  const isSignedIn = false;

  if (isSignedIn) {
    return <Redirect href={"/(tabs)"} />;
  }

  return <Redirect href={"/(auth)/welcome"} />;
};

export default IndexPage;
