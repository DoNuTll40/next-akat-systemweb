"use client";

import AuthHook from "@/hooks/AuthHook";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Forbidden from "@/app/forbidden";
import LoadingPage from "@/app/loading";

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = AuthHook();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // ถ้าการโหลดเสร็จแล้ว และไม่มี user หรือ user ไม่มี position
    if (!loading) {
      if (!user || !user.positions) {
        // redirect ไปหน้า login เมื่อ user ไม่ได้ login
        router.replace("/auth/login");
      }
      // ไม่ต้อง redirect ถ้า user เป็น admin (จะตรวจสอบใน return ข้างล่าง)
    }
  }, [user, loading, router]);

  // ถ้ากำลังโหลด หรือยังไม่ใช่ client-side
  if (loading || !isClient) {
    return <LoadingPage />;
  }

  // ถ้ามี user และ status เป็น admin ให้แสดง children
  // ถ้าไม่ใช่ admin ให้แสดง forbidden
  if (!user) {
    // ถ้าไม่มี user จะไม่มาถึงจุดนี้ เพราะถูก redirect ไปแล้วใน useEffect
    return <LoadingPage />;
  }

  return user?.status?.toLowerCase() === "admin" ? (
    <>{children}</>
  ) : (
    <Forbidden />
  );
}