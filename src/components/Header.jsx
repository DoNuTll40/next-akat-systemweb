"use client"

import AuthHook from "@/hooks/AuthHook.mjs";
import SideHook from "@/hooks/SideHook.mjs";
import { Avatar, Dropdown } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { AlignJustify, AlignLeft, IdCard, LogOut } from "lucide-react";

export default function Header() {
  const { logout } = AuthHook();
  const { isOpen, toggleSidebar } = SideHook();
  const user = { status: "ADMIN" }

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
      alert('ไปหน้าโปรไฟล์');
    } else if (key === '2') {
      logout()
    }
  };

  return (
    <div className="border-b border-gray-300 py-2 bg-white select-none">
        <div className="flex justify-between items-center mx-auto h-9 px-2">
            <div className="font-semibold text-md flex items-center gap-1">
              <button 
                onClick={toggleSidebar}
                className="p-4 rounded-lg hover:cursor-pointer"
              >
                  {isOpen ? (
                      <AlignLeft size={20} />
                  ) : (
                      <AlignJustify size={20} />
                  )}
              </button>
                <p>{ user.status === "ADMIN" ? "ผู้ดูแลระบบ" : ""}</p>
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
              <Avatar className="hover:cursor-pointer" onClick={(e) => e.preventDefault()} size={40} />
            </Dropdown>
            </div>
        </div>
    </div>
  )
}
