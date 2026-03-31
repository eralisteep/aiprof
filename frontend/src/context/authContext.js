"use client";
import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

axios.defaults.baseURL = process.env.API_BASE || "http://localhost:3000";
axios.defaults.withCredentials = true; // Важно для cookie из /login и /me

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // 🔹 Проверяем авторизацию (ME API)
  const { data: user, isLoading, refetch, isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get("/api/auth/me", { headers });
      return data;
    },
    retry: false, // Не перезапрашиваем при ошибке
    staleTime: 1000 * 60 * 60 * 12, // Кешируем данные на 12 часов
    gcTime: 0, // Не кешировать после unmount
  });
  const role = user?.role;
  // 🔹 Регистрация
  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password, role }) => {
      const { data } = await axios.post("/api/auth/register", { name, email, password, role });
      return data;
    },
    onSuccess: () => refetch(),
  });

  // 🔹 Логин
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await axios.post("/api/auth/login", { email, password });
      if (data?.token) {
        localStorage.setItem('authToken', data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      }
      return data;
    },
    onSuccess: () => refetch(),
  });

  // 🔹 Выход
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.removeQueries(["authUser"]); // Удаляем кеш
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isError,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Хук для использования AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
