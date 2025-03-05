import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";

// get doctor by id
export const useDoctorbyId = (id: string) => {
    return useQuery({
        queryKey: ["doctor", id],
        queryFn: async () => {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}/v1/doctor/${id}`);
            return response.data;
        }
    })
}

// query for search doctor
export const useSearchDoctor = (query: string) => {
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    console.log("useSearchDoctor called with query:", debouncedQuery);
    return useQuery({
        queryKey: ["doctor", "search", debouncedQuery],
        queryFn: async () => {
            console.log("Fetching search results for query:", debouncedQuery);
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}/v1/doctor/search?query=${debouncedQuery}`);
            return response.data;
        },
        enabled: !!debouncedQuery, // Ensure the query is only run when there is a search query
    });
}


// get all doctors by id
export const useDoctorsByIds = (doctorIds: string[]) => {
    return useQuery({
        queryKey: ["doctorsId", doctorIds],
        queryFn: async () => {
            const responose = await axios({
                method: 'POST',
                data: { doctorIds },
                url: `${process.env.EXPO_PUBLIC_BASE_URL}/v1/doctors/bulk`
            });
            return responose.data;
        }
    });
}

export const useGetAllDoctors = () => {
    return useQuery({
        queryKey: ["all-doctors"],
        queryFn: async () => {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}/v1/doctors`);
            return response.data;
        }
    });
}