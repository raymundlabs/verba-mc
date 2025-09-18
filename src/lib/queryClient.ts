import { QueryClient } from "@tanstack/react-query";

// Singleton QueryClient with conservative defaults for sensitive data
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh and avoid long-lived in-memory PHI
      staleTime: 0,
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      meta: { containsPHI: true },
    },
    mutations: {
      retry: 0,
    },
  },
});

export function clearAllAppCaches() {
  queryClient.clear();
}


