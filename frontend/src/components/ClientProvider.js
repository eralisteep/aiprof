"use client"; // Это клиентский компонент

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import ProtectedLayout from "./ProtectedLayout";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// const queryClient = new QueryClient();

export default function ClientProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  // const [queryClient] = useState(() => new QueryClient());
  // const queryClient = new QueryClient();
  
  useEffect(() => {
    setMounted(true);
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    // <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <ProtectedLayout>
          <div className="container">
            {children}
          </div>
        </ProtectedLayout>
      </ThemeProvider>
    // </QueryClientProvider>
  );
}
