import { AppointmentSchema } from "@/types/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAppointmentPost = (wallet_address: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (appointment: AppointmentSchema) => {
            const apiUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/v1/book`;
            try {
                const response = await axios({
                    method: 'post',
                    url: apiUrl,
                    data: appointment,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: `Bearer ${wallet_address}`,
                    },
                });

                console.log('API Response:', response);
                return response.data;
            } catch (error: any) {
                if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timed out. Please check your internet connection.');
                }
                if (error.response) {
                    console.error('Server responded with:', error.response.status, error.response.data);
                    throw new Error(`Server error: ${error.response.status}`);
                }
                if (error.request) {
                    console.error('No response received:', error.request);
                    throw new Error('No response from server. Please check your internet connection.');
                }
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointmentquery'] });
        }
    });
};

export const useAppointment = (wallet_address: string) => {
    return useQuery({
        queryKey: ['appointmentquery'],
        queryFn: async () => {
            const apiUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/v1/appointments`;
            try {
                const response = await axios({
                    method: 'get',
                    url: apiUrl,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: `Bearer ${wallet_address}`,
                    },
                });
                return response.data;
            } catch (error: any) {
                if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timed out. Please check your internet connection.');
                }
                if (error.response) {
                    console.error('Server responded with:', error.response.status, error.response.data);
                    throw new Error(`Server error: ${error.response.status}`);
                }
                if (error.request) {
                    console.error('No response received:', error.request);
                    throw new Error('No response from server. Please check your internet connection.');
                }
                throw error;
            }
        }
    })
}