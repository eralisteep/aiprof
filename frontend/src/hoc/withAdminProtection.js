"use client";

import { useAuth } from "@/src/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withAdminProtection(Component) {
  return function ProtectedComponent(props) {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;
      
      if (!user) {
        router.push("/auth/login");
      } else if (role !== "admin") {
        router.push("/auth/login");
      }
    }, [user, role, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      );
    }

    if (!user || role !== "admin") {
      return null;
    }

    return <Component {...props} />;
  };
}
