"use client"

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import ProtectedAdminRoute from "../protectedAdminRoute";

export default function Layout({ children }) {

    const pathName = usePathname();

    if(pathName === "/admin/login"){
      return <>{children}</>
    }

    return (
      <ProtectedAdminRoute>
        <div className="h-screen flex flex-col bg-gray-300">
          <Header className="flex-shrink-0" />
          <div className="flex flex-grow overflow-hidden">
              <Sidebar className="flex-shrink-0 w-64" />
            <div className="flex flex-col flex-grow overflow-hidden">
              <div className="flex-grow overflow-y-auto p-4">
                {children}
              </div>
              <Footer className="flex-shrink-0" />
            </div>
          </div>
        </div>
      </ProtectedAdminRoute>
    );
  }