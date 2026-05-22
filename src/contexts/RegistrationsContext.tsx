import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getApiUrl } from "@/lib/api";

export interface Registration {
  id: string;
  postId: string;
  postTitle: string;
  postCategory: string;
  postedBy: string;
  name: string;
  rollNumber: string;
  email: string;
  department: string;
  phone: string;
  registeredAt: string;
}

interface Ctx {
  registrations: Registration[];
  register: (r: Omit<Registration, "id" | "registeredAt">) => Promise<void>;
  unregister: (postId: string, rollNumber: string) => Promise<void>;
  isRegistered: (postId: string, rollNumber?: string) => boolean;
}

const RegistrationsContext = createContext<Ctx | undefined>(undefined);

export const RegistrationsProvider = ({ children }: { children: ReactNode }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await fetch(getApiUrl("/api/registrations"));
        if (!response.ok) return;
        const data = await response.json();
        setRegistrations(data);
      } catch (error) {
        console.error("Failed to load registrations", error);
      }
    };

    fetchRegistrations();
  }, []);

  const register: Ctx["register"] = async (r) => {
    try {
      const response = await fetch(getApiUrl("/api/registrations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      if (!response.ok) return;
      const saved = await response.json();
      setRegistrations((prev) => [
        ...prev,
        {
          ...r,
          id: saved._id || crypto.randomUUID(),
          registeredAt: saved.registeredAt || new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to save registration", error);
    }
  };

  const unregister: Ctx["unregister"] = async (postId, rollNumber) => {
    try {
      const response = await fetch(getApiUrl("/api/registrations"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, rollNumber }),
      });
      if (!response.ok) return;
      setRegistrations((prev) => prev.filter((r) => !(r.postId === postId && r.rollNumber === rollNumber)));
    } catch (error) {
      console.error("Failed to remove registration", error);
    }
  };

  const isRegistered = (postId: string, rollNumber?: string) =>
    registrations.some((r) => r.postId === postId && (!rollNumber || r.rollNumber === rollNumber));

  return (
    <RegistrationsContext.Provider value={{ registrations, register, unregister, isRegistered }}>
      {children}
    </RegistrationsContext.Provider>
  );
};

export const useRegistrations = () => {
  const ctx = useContext(RegistrationsContext);
  if (!ctx) throw new Error("useRegistrations must be used within RegistrationsProvider");
  return ctx;
};
