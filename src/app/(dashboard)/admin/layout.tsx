"use client";

import { useAuthUser } from "@/contexts/AuthUserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user.role, router]);

  if (user.role !== "ADMIN") {
    return null;
  }

  return children;
}