"use client";

import { AuthProvider } from "@/src/context/authContext";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@/src/index.css";
import "@/src/App.css";

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>AIProf</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="AIProf - Professional AI Platform" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
