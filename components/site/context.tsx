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
  path = "/",
  children,
}: {
  data: SiteData;
  path?: string;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null),
    [authLoading, setAuthLoading] = useState(true);
  const refreshUser = async () => {
    try {
      const r = await api("auth/me");
      setUser(r.user);
      return r.user;
    } finally {
      setAuthLoading(false);
    }
  };
  useEffect(() => {
    refreshUser();
  }, []);
  return (
    <Context.Provider value={{ ...data, path, user, authLoading, refreshUser }}>
      {children}
    </Context.Provider>
  );
}
export const useSite = () =>
  useContext(Context) as SiteData & {
    path: string;
    user: any;
    authLoading: boolean;
    refreshUser: () => Promise<any>;
  };
