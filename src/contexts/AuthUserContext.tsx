"use client";

import {
  createContext,
  ReactNode,
  useContext,
} from "react";

export type AuthUser = {
  sub: number;
  email: string;
  role: "USER" | "ADMIN";
};

type AuthUserContextValue = {
  user: AuthUser;
};

const AuthUserContext =
  createContext<AuthUserContextValue | null>(null);

type Props = {
  user: AuthUser;
  children: ReactNode;
};

export function AuthUserProvider({
  user,
  children,
}: Props) {
  return (
    <AuthUserContext.Provider value={{ user }}>
      {children}
    </AuthUserContext.Provider>
  );
}

export function useAuthUser() {
  const context = useContext(AuthUserContext);

  if (!context) {
    throw new Error(
      "useAuthUser debe utilizarse dentro de AuthUserProvider",
    );
  }

  return context;
}