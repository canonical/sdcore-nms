import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";

export const handleRefresh = async (queryClient: QueryClient, authToken?: string | null) => {
    try {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: [queryKeys.subscribers, authToken],
                refetchActive: true,
            }),
            queryClient.invalidateQueries({
                queryKey: [queryKeys.deviceGroups, authToken],
                refetchActive: true,
            }),
            queryClient.invalidateQueries({
                queryKey: [queryKeys.networkSlices, authToken],
                refetchActive: true,
            }),
        ]);
        console.log("Refreshed queries.");
    } catch (error) {
        console.error("Error refreshing queries:", error);
    }
};