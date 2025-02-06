"use client";

import {
  QueryClientProvider,
  QueryClient,
  isServer,
} from "@tanstack/react-query";

function makeQueryCLient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryCLient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryCLient();
    }
    return browserQueryClient;
  }
}
const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();
  // const [queryClient] = useState(
  //   () =>
  //     new QueryClient({
  //       defaultOptions: {
  //         queries: {
  //           staleTime: 1000 * 60,
  //         },
  //       },
  //     }),
  // );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
