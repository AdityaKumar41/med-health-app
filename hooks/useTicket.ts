import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTicketData = (wallet_address: string, patientId: string) => {
  return useQuery({
    queryKey: ["ticket", patientId],
    queryFn: async () => {
      // Return empty data if patientId is not available
      if (!patientId) {
        return { data: [] };
      }

      const apiUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/v1/ticket/patient/${patientId}`;
      try {
        const response = await axios({
          method: "get",
          url: apiUrl,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${wallet_address}`,
          },
        });
        return response.data;
      } catch (error: any) {
        if (error.code === "ECONNABORTED") {
          throw new Error(
            "Request timed out. Please check your internet connection."
          );
        }
        if (error.response) {
          throw new Error(`Server error: ${error.response.status}`);
        }
        if (error.request) {
          throw new Error(
            "No response from server. Please check your internet connection."
          );
        }
        throw error;
      }
    },
    enabled: !!wallet_address && !!patientId, // Only run query if wallet address and patientId are available
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
