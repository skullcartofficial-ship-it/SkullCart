// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { setCurrentUser, migrateGuestCartToUser, getCart } from "../cart";
import addressService from "../services/addressService";

interface User {
  email: string;
  name?: string;
  uid?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user was logged in before
    const savedUser = localStorage.getItem("current_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setCurrentUser(parsedUser.email);
      console.log("👤 User restored from storage:", parsedUser.email);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with your actual authentication
      // For demo purposes, we'll simulate a successful login

      // In a real app, you'd do: const response = await authAPI.login(email, password);

      const userData: User = { email };

      // Save user to localStorage
      localStorage.setItem("current_user", JSON.stringify(userData));
      setUser(userData);

      // Migrate guest cart to user cart (if any)
      const migratedCart = migrateGuestCartToUser(email);
      console.log("Cart migrated:", migratedCart.length, "items");

      // Set current user in cart service
      setCurrentUser(email);

      console.log("✅ Login successful for:", email);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("👋 Logging out user:", user?.email);

    // Clear current user but keep data in localStorage
    localStorage.removeItem("current_user");
    setUser(null);
    setCurrentUser(null);

    // Don't clear cart or address data - it remains in localStorage for next login
    console.log("User logged out, data preserved for next login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
