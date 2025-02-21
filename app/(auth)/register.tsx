import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/Button";
import { router } from "expo-router";
import { useAccount, useWriteContract } from "wagmi";
import { Ionicons } from '@expo/vector-icons';
import { FormData, FormErrors, InputDetailType } from "@/types/type";
import axios from "axios";
import { usePatient, usePatientPost } from "@/hooks/usePatient";
import abi from "../../contract/Contract.json"

const Register = () => {
  const { address } = useAccount();
  const { data } = usePatient(address!);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    age: '',
    gender: '',
    bloodGroup: '', // Add blood group field
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const { mutate } = usePatientPost(address!);

  // if data is present redirect to home page
  useEffect(() => {
    if (data) {
      router.replace("/(root)/(tabs)");
    }
  }, [data]);

  const InputDetails: InputDetailType[] = [
    {
      label: "Full Name",
      placeholder: "John Doe",
      key: "fullName",
      icon: "person-outline",
      keyboardType: "default"
    },
    {
      label: "Email",
      placeholder: "johndoe@example.com",
      key: "email",
      icon: "mail-outline",
      keyboardType: "email-address"
    },
    {
      label: "Age",
      placeholder: "Enter your age",
      key: "age",
      icon: "calendar-outline",
      keyboardType: "numeric"
    },
    {
      label: "Gender",
      placeholder: "Enter gender (Male/Female/Other)",
      key: "gender",
      icon: "people-outline",
      keyboardType: "default"
    },
    {
      label: "Blood Group",
      placeholder: "Enter blood group (A+, B+, O+, etc.)",
      key: "bloodGroup",
      icon: "water-outline",
      keyboardType: "default"
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 0) {
      newErrors.age = "Please enter a valid age";
    }

    // Gender validation
    if (!formData.gender.trim()) {
      newErrors.gender = "Gender is required";
    }

    // Blood group validation
    if (!formData.bloodGroup.trim()) {
      newErrors.bloodGroup = "Blood group is required";
    } else if (!/^(A|B|AB|O)[+-]$/.test(formData.bloodGroup.toUpperCase())) {
      newErrors.bloodGroup = "Please enter a valid blood group (A+, B+, O+, etc.)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  const handleOnRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // writeContract({
    //   abi,
    //   address: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`,
    //   functionName: "registerPatient",
    //   args: [address, formData.fullName, formData.email, Number(formData.age)]
    // })

    try {


      const response = mutate({
        name: formData.fullName,
        email: formData.email,
        age: Number(formData.age),
        gender: formData.gender,
        blood_group: formData.bloodGroup.toUpperCase(),
        wallet_address: address!
      });

      console.log("responose is ", response)

      // if () {
      //   console.log("Registration successful", response.data);
      //   router.replace("/(root)/(tabs)");
      // } else {
      //   setErrors({ submit: 'Registration failed. Please try again.' });
      // }
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-6 mt-8">
          <Text className="font-JakartaExtraBold text-4xl mb-3">Create Account</Text>
          <Text className="font-JakartaRegular text-base text-gray-600 mb-2">
            Please fill in your details to get started
          </Text>
          {address && (
            <Text className="font-JakartaMedium text-sm text-gray-500 mb-4">
              Wallet: {address.slice(0, 6)}...{address.slice(-4)}
            </Text>
          )}
        </View>

        <View className="px-6">
          {InputDetails.map((input, index) => (
            <View key={index} className="mb-2">
              <InputField
                label={input.label}
                placeholder={input.placeholder}
                value={formData[input.key]}
                onChangeText={(text: string) => handleInputChange(input.key, text)}
                error={errors[input.key]}
                secureTextEntry={input.secureTextEntry}
                keyboardType={input.keyboardType}
                icon={input.icon}
              />
              {errors[input.key] && (
                <Text className="text-red-500 text-sm mt-1">{errors[input.key]}</Text>
              )}
            </View>
          ))}
        </View>

        <View className="p-6">
          <Button
            text={loading ? "Creating Account..." : "Create Account"}
            onClick={handleOnRegister}
            disabled={loading}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;
