"use client";

import { SidebarContextProvider } from "@/contexts/SidebarContext";
import NextTopLoader from "nextjs-toploader";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/primereact.min.css";
import { ToastContainer } from "react-toastify";

export default function Providers({ children }) {
  const value = {
    ripple: true,
  };

  return (
    <SidebarContextProvider>
      <PrimeReactProvider value={value}>
        <NextTopLoader showSpinner={false}/>
          <ToastContainer autoClose={2000} closeOnClick />
          {children}
      </PrimeReactProvider>
    </SidebarContextProvider>
  );
}
