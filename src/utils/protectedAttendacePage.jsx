"use client";

import AuthHook from "@/hooks/AuthHook";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingPage from "../app/loading";
import { toast } from "react-toastify";

export default function ProtectedAttendancePage({ children }) {
  const { user, loading } = AuthHook();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    // ถ้าไม่ได้ login
    if (!user || !user.positions) {
      router.replace("/admin/auth/login");
      return;
    }

    const allowDepartments = [12, 15];

    // ถ้า department ไม่ตรง → redirect พร้อม toast
    if (!allowDepartments.includes(user?.departments?.department_id)) {
      toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      router.replace(`/${user?.status.toLowerCase()}`);
      return;
    }

    // ผ่านทุกเงื่อนไข
    setChecked(true);
  }, [user, loading, router]);

  if (loading || !checked) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
