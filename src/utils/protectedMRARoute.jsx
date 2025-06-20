"use client";

import AuthHook from "@/hooks/AuthHook";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingPage from "../app/loading";
import Forbidden from "../app/forbidden";
import { toast } from "react-toastify";

export default function ProtectedMRARoute({ children }) {
  const { user, loading } = AuthHook();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || loading) return;

    if (!user || !user.positions) {
      router.replace("/auth/login");
      return;
    }

    const allowDepartments = [26, 34, 41];
    const departmentId = user?.departments?.department_id;

    if (!allowDepartments.includes(departmentId)) {
      toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      router.replace(`/${user.status.toLowerCase()}`);
    }
  }, [isClient, user, loading, router]);

  if (loading || !isClient) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
