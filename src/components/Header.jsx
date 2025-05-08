"use client"

import AppHook from "@/hooks/AppHook.mjs";
import AuthHook from "@/hooks/AuthHook.mjs";
import SideHook from "@/hooks/SideHook.mjs";
import { Avatar, Dropdown } from "antd";
import axios from "axios";
import { AlignJustify, AlignLeft, IdCard, LogOut, PanelLeft, PanelLeftClose } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const { setShowModalProfile } = AppHook();
  const { logout, user } = AuthHook();
  const { isOpen, toggleSidebar } = SideHook();
  const [profileImage, setProfileImage] = useState(null)

  const items = [
    {
      key: '1',
      label: <span onClick={() => hdlMenuClick('1')}>โปรไฟล์</span>,
      icon: <IdCard size={15} />,
    },
    {
      key: '2',
      label: <span onClick={() => hdlMenuClick('2')}>ออกจากระบบ</span>,
      icon: <LogOut size={15} />,
      danger: true,
    },
  ];

  const hdlMenuClick = (key) => {
    if (key === '1') {
      setShowModalProfile(true);
    } else if (key === '2') {
      logout()
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [])

  const fetchProfile = async () => {
    try {
      let token = localStorage.getItem("token")

      const rs = await axios.get("/auth/fetchImage", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: "blob"
      })

      if(rs.status === 200){
        const blob = rs.data;
        const url = window.URL.createObjectURL(blob);
        setProfileImage(url); // เก็บ URL ใน state
      }

      // ปล่อย URL เมื่อ component ถูก unmount
      return () => window.URL.revokeObjectURL(url);
    } catch (err) {
      setProfileImage(null)
    }
  }

  return (
    <div className="border-b border-gray-300 py-2 bg-white select-none">
        <div className="flex justify-between items-center mx-auto h-9 px-2">
            <div className="font-semibold text-md flex items-center gap-0.5">
              <button 
                onClick={toggleSidebar}
                className="p-4 rounded-lg hover:cursor-pointer"
              >
                  {isOpen ? (
                      <PanelLeftClose strokeWidth={1.5} size={22} />
                  ) : (
                      <PanelLeft strokeWidth={1.5} size={22} />
                  )}
              </button>
                <p>{ user?.status === "ADMIN" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}</p>
            </div>
            <div>
            <Dropdown
              menu={{
                items,
              }}
              trigger={['click']}
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
              className="font-sans"
            >
              <Avatar className="hover:cursor-pointer shadow hover:opacity-80 animate-fadeIn" src={profileImage ? profileImage : `/hospital/images/profile.jpg`} onClick={(e) => e.preventDefault()} size={40} />
            </Dropdown>
            </div>
        </div>
    </div>
  )
}
