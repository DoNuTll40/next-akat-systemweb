"use client"

import { createContext, useEffect, useState } from "react"

export const SidebarContext = createContext();

function SidebarContextProvider({ children }) {
    const [isOpen, setIsOpen] = useState(true); // สถานะเปิด/ปิด
    const [isMini, setIsMini] = useState(false); // สถานะขนาดย่อ
    const [openHamburger, setOpenHamburger] = useState(false);
  
    // ฟังก์ชันเปิด/ปิด Sidebar
    const toggleSidebar = () => {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      localStorage.setItem("fullBar", newIsOpen);
    };
  
    // ฟังก์ชันเปิด/ปิด Sidebar แบบย่อ
    const toggleMini = () => {
      const newIsMini = !isMini;
      setIsMini(newIsMini);
      localStorage.setItem("miniBar", newIsMini);
    };

    const toggleHamburger = () => {
      setOpenHamburger((prev) => !prev);
    };
  
    // โหลดสถานะจาก localStorage เมื่อ component ถูก mount
    useEffect(() => {
      const savedMiniBar = localStorage.getItem("miniBar");
      const savedFullBar = localStorage.getItem("fullBar");
      const savedHamburger = localStorage.getItem("hamburger");
  
      if (savedMiniBar !== null) {
        setIsMini(savedMiniBar === "true");
      }
      if (savedFullBar !== null) {
        setIsOpen(savedFullBar === "true");
      } 
    }, []);
  
    const value = { isOpen, isMini, toggleSidebar, toggleMini, openHamburger, toggleHamburger };

    return (
        <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
    )
};

export { SidebarContextProvider };
export default SidebarContext;