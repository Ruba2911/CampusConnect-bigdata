import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserRole } from "@/data/mockData";
import { getApiUrl } from "@/lib/api";

export interface AuthUser {
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  rollNumber?: string;
  clubName?: string;
  department?: string;
  phone?: string;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userProfile: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  signup: (user: AuthUser & { password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const STORAGE_AUTH_KEY = "campusconnect_current_user";

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    }
  }, [currentUser]);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || "Login failed." };
      }
      setCurrentUser(data.user);
      return { success: true, message: data.message || "Logged in successfully." };
    } catch (error) {
      return { success: false, message: "Unable to connect to the server." };
    }
  };

  const signup = async (user: AuthUser & { password: string }) => {
    try {
      const response = await fetch(getApiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || "Sign up failed." };
      }
      setCurrentUser(data.user);
      return { success: true, message: data.message || "Account created successfully." };
    } catch (error) {
      return { success: false, message: "Unable to connect to the server." };
    }
  };

  const logout = () => setCurrentUser(null);

  const setRole = (role: UserRole) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, role });
  };

  const role = currentUser?.role ?? "student";
  const userName = currentUser?.name ?? "Guest";

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        userName,
        userProfile: currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
