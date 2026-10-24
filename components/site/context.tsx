"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { Entry } from "@/lib/content";
export type SiteData = {
  organization: Record<string, any>;
  content: Entry[];
  paymentsEnabled: boolean;
  emailEnabled: boolean;
};
const Context = createContext<any>(null);
export function SiteProvider({
  data,
  children,
}: {
  data: SiteData;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null),
    [authLoading, setAuthLoading] = useState(true);
  const refreshUser = async () => {
    try {
      const r = await api("auth/me");
      setUser(r.user);
    } finally {
      setAuthLoading(false);
    }
  };
  useEffect(() => {
    refreshUser();
  }, []);
  return (
    <Context.Provider value={{ ...data, user, authLoading, refreshUser }}>
      {children}
    </Context.Provider>
  );
}
export const useSite = () =>
  useContext(Context) as SiteData & {
    user: any;
    authLoading: boolean;
    refreshUser: () => Promise<void>;
  };
