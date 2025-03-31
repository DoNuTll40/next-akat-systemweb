"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import ProtectedAdminRoute from "../protectedAdminRoute";
import { IdleTimerProvider } from "react-idle-timer";
import AuthHook from "@/hooks/AuthHook.mjs";
import { toast } from "react-toastify";

export default function Layout({ children }) {
  const { logout, errMsg, setErrMsg } = AuthHook();
  const pathName = usePathname();

  if (pathName.startsWith("/admin/auth")) {
    return <>{children}</>;
  }

  const hdlIdle = () => {
    logout();
    setErrMsg("ระบบได้ทำการ ออกจากระบบให้ เนื่องจากไม่มีการใช้งานระบบ เป็นระยะเวลาตามที่กำหนด...")
    toast(
      "ระบบได้ทำการ ออกจากระบบให้ เนื่องจากไม่มีการใช้งานระบบ เป็นระยะเวลาตามที่กำหนด...",
      {
        type: "warning",
        theme: "light",
        autoClose: false,
      }
    );
  };

  return (
    <ProtectedAdminRoute>
      <IdleTimerProvider timeout={30 * 60 * 1000} onIdle={hdlIdle}>
        <div className="h-screen flex flex-col">
          <Header className="flex-shrink-0" />
          <div className="flex flex-grow overflow-hidden">
            <Sidebar className="max-w-[16rem] flex-shrink-0" />
            <div className="flex flex-col flex-grow overflow-hidden">
              <div className="flex-grow overflow-y-auto p-4 max-w-full bg-gray-300">
                {children}
              </div>
              <Footer className="flex-shrink-0 h-[2rem] min-h-[2rem]" />
            </div>
          </div>
        </div>
      </IdleTimerProvider>
    </ProtectedAdminRoute>
  );
}
