import { View, Text } from "react-native";
import { Redirect } from "expo-router";
import { usePatient } from "@/hooks/usePatient";
import { useAccount } from "wagmi";


// root index page where we check if the user is a patient or not
// if the user is a patient, we redirect them to the home page

const IndexPage = () => {
  const { address } = useAccount();
  const { data } = usePatient(address!);

  if (!data) {
    return <Redirect href={"/(auth)/welcome"} />;
  }
  return <Redirect href={"/(root)/(tabs)"} />;

};

export default IndexPage;
