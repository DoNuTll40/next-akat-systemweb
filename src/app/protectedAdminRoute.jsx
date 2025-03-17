"use client";

import AuthHook from "@/hooks/AuthHook";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingPage from "./loading";
import Forbidden from "./forbidden";

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = AuthHook();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // ป้องกัน Hydration Error

    if (!loading && (!user || !user.position)) {
      router.replace("/admin/login");
    }

  }, [user, loading, router]);

  if (loading || !isClient) {
    return <LoadingPage />;
  }

  return user?.status?.toLowerCase() === "admin" ? <>{children}</> : <Forbidden />;
}
