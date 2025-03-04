import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useNavigation } from "expo-router";
import { images } from "@/constants/image";
import { Ionicons } from "@expo/vector-icons";

// Types definition
type Medication = {
    id: number;
    name: string;
    description: string;
    price: string;
    image: any;
    category: string;
};

type Category = {
    id: number;
    name: string;
};

// Mock data for medications
const medications: Medication[] = [
    {
        id: 1,
        name: "Paracetamol",
        description: "Pain reliever and fever reducer",
        price: "POL 5.99",
        image: images.medical1,
        category: "Pain Relief"
    },
    {
        id: 2,
        name: "Amoxicillin",
        description: "Antibiotic used to treat bacterial infections",
        price: "POL 12.50",
        image: images.medical2,
        category: "Antibiotics"
    },
    {
        id: 3,
        name: "Loratadine",
        description: "Antihistamine for allergy relief",
        price: "POL 8.75",
        image: images.medical3,
        category: "Allergies"
    },
    {
        id: 4,
        name: "Omeprazole",
        description: "Reduces stomach acid production",
        price: "POL 14.99",
        image: images.medical4,
        category: "Digestive"
    },
    {
        id: 5,
        name: "Vitamin D3",
        description: "Supports bone health and immune function",
        price: "POL 9.25",
        image: images.medical5,
        category: "Supplements"
    },
    {
        id: 6,
        name: "Ibuprofen",
        description: "Anti-inflammatory pain reliever",
        price: "POL 6.49",
        image: images.medical6,
        category: "Pain Relief"
    },
];

// Category data
const categories: Category[] = [
    { id: 1, name: "All" },
    { id: 2, name: "Pain Relief" },
    { id: 3, name: "Antibiotics" },
    { id: 4, name: "Allergies" },
    { id: 5, name: "Digestive" },
    { id: 6, name: "Supplements" },
];

// Medicine card component
const MedicineCard = ({
    item,
    onAddToCart
}: {
    item: Medication,
    onAddToCart: (item: Medication) => void
}) => {
    return (
        <View className="w-[48%] bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
            <View className="p-3 items-center">
                <Image
                    source={item.image}
                    className="w-24 h-24 rounded-lg mb-2"
                    resizeMode="contain"
                />
                <Text className="font-JakartaBold text-base text-gray-800">{item.name}</Text>
                <Text numberOfLines={2} className="text-xs text-gray-500 mb-2 h-8">{item.description}</Text>
                <View className="flex-row justify-between w-full items-center">
                    <Text className="font-JakartaBold text-blue-600">{item.price}</Text>
                    <TouchableOpacity
                        className="bg-blue-500 rounded-full p-1"
                        onPress={() => onAddToCart(item)}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// Category filter component
const CategoryFilter = ({
    categories,
    activeCategory,
    onSelectCategory
}: {
    categories: Category[],
    activeCategory: string,
    onSelectCategory: (category: string) => void
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
        >
            {categories.map((category) => (
                <TouchableOpacity
                    key={category.id}
                    onPress={() => onSelectCategory(category.name)}
                    className={`px-4 py-2 mr-2 rounded-full h-10 justify-center items-center ${activeCategory === category.name ? 'bg-blue-500' : 'bg-gray-100'
                        }`}
                >
                    <Text
                        className={`font-Jakarta ${activeCategory === category.name ? 'text-white' : 'text-gray-700'
                            }`}
                    >
                        {category.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const Pharma = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [cartItems, setCartItems] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Filter medications based on search query and active category
    const filteredMedications = medications.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            med.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = activeCategory === "All" || med.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    const addToCart = (item: Medication) => {
        setCartItems(prev => [...prev, item]);
        // You could show a toast or notification here
    };

    // Mock loading effect
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [activeCategory]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="bg-white px-4 pt-6 pb-4">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-JakartaBold text-gray-900">Pharmacy</Text>
                    <View className="relative">
                        <TouchableOpacity>
                            <Ionicons name="cart-outline" size={24} color="#374151" />
                            {cartItems.length > 0 && (
                                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                                    <Text className="text-white text-xs">{cartItems.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View className="px-4 mb-4">
                <View className="flex-row items-center bg-gray-100 px-3 rounded-xl">
                    <Ionicons name="search" size={24} color="white" />
                    <TextInput
                        className="flex-1 py-3"
                        placeholder="Search for medicines"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category Filters */}
            <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            {/* Medication List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-1 flex-row flex-wrap justify-between px-4 pb-20 my-4">
                        {filteredMedications.map((med) => (
                            <MedicineCard key={med.id} item={med} onAddToCart={addToCart} />
                        ))}
                        {filteredMedications.length === 0 && (
                            <View className="w-full items-center justify-center py-20">
                                {/* <Ionicons name="empty" size={24} color="white" /> */}
                                <Text className="text-gray-500">No medications found</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default Pharma;
