"use client";

import ProfileModal from "@/components/modals/ProfileModal";
import SignaturePadModal from "@/components/modals/SignaturePadModal";
import AppHook from "@/hooks/AppHook.mjs";
import AuthHook from "@/hooks/AuthHook.mjs";
import { IdleTimerProvider } from "react-idle-timer";
import { toast } from "react-toastify";
import ProtectedUsersRoute from "../protectedUsersRoute";
import SlideAlert from "@/components/SlideAlert";
import Header from "@/components/mra/Header";
import Footer from "@/components/mra/Footer";
import SideBar from "@/components/mra/Sidebar";
import { MRAThemeContextProvider } from "@/contexts/theme/MRAThemeContext";

export default function Layout({ children }) {
  const { showModalProfile } = AppHook();
  const { logout, setErrMsg, user } = AuthHook();

  const hdlIdle = () => {
    logout();
    setErrMsg(
      "ระบบได้ทำการ ออกจากระบบให้ เนื่องจากไม่มีการใช้งานระบบ เป็นระยะเวลาตามที่กำหนด..."
    );
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
    <ProtectedUsersRoute>
      <MRAThemeContextProvider>
        <IdleTimerProvider timeout={30 * 60 * 1000} onIdle={hdlIdle}>
          <div className="h-screen flex flex-col bg-gray-300">
            {!user?.signature_status && <SignaturePadModal />}
            {showModalProfile && <ProfileModal />}
            <Header className="flex-shrink-0" />
            <div className="flex flex-grow overflow-hidden">
              <SideBar className="flex-shrink-0 w-64" />
              <div className="flex flex-col flex-grow overflow-hidden">
                <div className="flex-grow overflow-y-auto p-4 pt-14 relative max-w-full bg-gray-300">
                  <SlideAlert />
                  {children}
                </div>
                <Footer className="flex-shrink-0" />
              </div>
            </div>
          </div>
        </IdleTimerProvider>
      </MRAThemeContextProvider>
    </ProtectedUsersRoute>
  );
}
