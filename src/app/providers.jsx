"use client";

import { AppContextProvider } from "@/contexts/AppContext";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { SidebarContextProvider } from "@/contexts/SidebarContext";
import NextTopLoader from "nextjs-toploader";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/primereact.min.css";
import "@ant-design/v5-patch-for-react-19";
import { ToastContainer } from "react-toastify";
import { GpsContextProvider } from "@/contexts/GpsContext";
import { ConfigProvider } from "antd";

export default function Providers({ children }) {
  const value = {
    ripple: true,
  };

  return (
    <AppContextProvider>
      <AuthContextProvider>
        <SidebarContextProvider>
          <GpsContextProvider>
            <PrimeReactProvider value={value}>
              <ConfigProvider theme={{ token: { fontFamily: "Sarabun" } }} >
                <NextTopLoader showSpinner={false} />
                <ToastContainer autoClose={2000} theme="colored" closeOnClick />
                {children}
              </ConfigProvider>
            </PrimeReactProvider>
          </GpsContextProvider>
        </SidebarContextProvider>
      </AuthContextProvider>
    </AppContextProvider>
  );
}
