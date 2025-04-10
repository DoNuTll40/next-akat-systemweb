"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProfileModal from "@/components/modals/ProfileModal";
import Sidebar from "@/components/Sidebar";
import AppHook from "@/hooks/AppHook.mjs";

export default function Layout({ children }) {
    const { showModalProfile } = AppHook();
    return (
      <div className="h-screen flex flex-col bg-gray-300">
        { showModalProfile && <ProfileModal /> }
        <Header className="flex-shrink-0" />
        <div className="flex flex-grow overflow-hidden">
            <Sidebar className="flex-shrink-0 w-64" />
          <div className="flex flex-col flex-grow overflow-hidden">
            <div className="flex-grow overflow-y-auto p-4">{children}</div>
            <Footer className="flex-shrink-0" />
          </div>
        </div>
      </div>
    );
  }