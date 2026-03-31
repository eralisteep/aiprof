"use client";

import { useAuth } from "@/src/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { withAdminProtection } from "@/src/hoc/withAdminProtection";

function Home() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    if (role === "admin") {
      router.push("/admin");
    }
  }, [role, isLoading, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AIProf</h1>
        <p className="text-gray-600">Добро пожаловать, {user?.name}</p>
      </div>
    </div>
  );
}

export default withAdminProtection(Home);
