import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface PatientData {
    name: string;
    email: string;
    age: number;
    gender: string;
    wallet_address: string;
}

export const usePatientPost = () => {
    return useMutation({
        mutationFn: async (patient: PatientData) => {
            const apiUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/v1/patient`;
            try {
                const response = await axios({
                    method: 'post',
                    url: apiUrl,
                    data: patient,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
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
        onSuccess: (data) => {
            return data;
        }
    });
}

export const usePatient = () => {
    return useQuery({
        queryKey: ['patient'],
        queryFn: async () => {
            const responose = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}/v1/patient`);
            return responose.data;
        }
    })
}