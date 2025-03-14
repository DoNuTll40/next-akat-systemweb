"use client"

import SideHook from "@/hooks/SideHook.mjs";
import { Avatar } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { AlignJustify, AlignLeft } from "lucide-react";

export default function Header() {

  const { isOpen, toggleSidebar } = SideHook();
  const user = { status: "ADMIN" }

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
                <Avatar size={40} />
            </div>
        </div>
    </div>
  )
}
