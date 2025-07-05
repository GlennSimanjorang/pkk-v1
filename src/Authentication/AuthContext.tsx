import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

import type { ReactNode } from "react";

interface User {
  id: number;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      fetchUserData(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseUrl}/api/v1/auth/self`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.content);
    } catch (error) {
      console.error("Failed to fetch user data", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User, token: string) => {
    Cookies.set("token", token, { expires: 7 });
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
