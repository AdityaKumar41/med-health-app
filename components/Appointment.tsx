import { View, Text, Image } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { AppointmentProps } from '@/types/type'

const AppointmentCard = ({
    image,
    name,
    date,
    specialty
}: AppointmentProps) => {
    return (
        <View className="flex gap-2 items-start p-3 tracking-wide text-white bg-blue-600 mx-4 rounded-lg">
            <View
                className={`flex overflow-hidden relative gap-4 items-start p-2 to-blue-600 rounded-xl min-w-[240px] w-full justify-center`}
            >
                <View className="flex z-0 flex-col">
                    <View className="flex flex-row items-center gap-3">
                        <Image
                            source={{ uri: image }}
                            className="w-12 h-12 rounded-lg"
                        />
                        <View>
                            <Text className="font-JakartaBold text-lg text-white">{name}</Text>
                            <Text className="font-JakartaBold text-white text-base">
                                {specialty}
                            </Text>
                        </View>
                    </View>
                    <View className="flex flex-row justify-start mt-3 bg-black/10 rounded-lg p-2 w-full">
                        <View className="flex flex-row items-center">
                            <Ionicons name="calendar-outline" size={16} color="white" />
                            <Text className="font-Jakarta text-white text-base ml-2">
                                {date}
                            </Text>
                        </View>
                        {/* <View className="flex flex-row items-center ml-4">
                            <Ionicons name="time-outline" size={16} color="white" />
                            <Text className="font-JakartaBold text-white text-base ml-2">
                                10:00 AM
                            </Text>
                        </View> */}
                    </View>
                </View>
            </View>
        </View>
    )
}

export default AppointmentCard