"use client";

import { useAuth } from "@/src/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push("/auth/login");
    } else if (role === "admin") {
      router.push("/admin");
    }
  }, [user, role, isLoading, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AIProf</h1>
        <p className="text-gray-600">Загрузка...</p>
      </div>
    </div>
  );
}
