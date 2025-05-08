"use client";

import AppHook from "@/hooks/AppHook.mjs";
import AuthHook from "@/hooks/AuthHook.mjs";
import SideHook from "@/hooks/SideHook.mjs";
import { Avatar, Dropdown } from "antd";
import axios from "axios";
import {
  AlignJustify,
  AlignLeft,
  IdCard,
  LogOut,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MRAThemeSelectorModal from "../modals/MRAThemeSelectorModal";
import MRAThemeHook from "@/hooks/MRAThemeHook.mjs";

export default function Header() {
  const { setShowModalProfile } = AppHook();
  const { logout, user } = AuthHook();
  const { isOpen, toggleSidebar } = SideHook();
  const [profileImage, setProfileImage] = useState(null);
  const router = useRouter();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { themeMRA } = MRAThemeHook();

  const items = [
    {
      key: "1",
      label: <span onClick={() => hdlMenuClick("1")}>ปรับแต่งสี</span>,
      icon: <IdCard size={15} />,
    },
    {
      key: "2",
      label: <span onClick={() => hdlMenuClick("2")}>กลับระบบหลัก</span>,
      icon: <LogOut size={15} />,
      danger: true,
    },
  ];

  const hdlMenuClick = (key) => {
    if (key === "1") {
      setShowThemeModal(true);
    } else if (key === "2") {
      router.push("/admin");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      let token = localStorage.getItem("token");

      const rs = await axios.get("/auth/fetchImage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      if (rs.status === 200) {
        const blob = rs.data;
        const url = window.URL.createObjectURL(blob);
        setProfileImage(url); // เก็บ URL ใน state
      }

      // ปล่อย URL เมื่อ component ถูก unmount
      return () => window.URL.revokeObjectURL(url);
    } catch (err) {
      setProfileImage(null);
    }
  };

  return (
    <div
      className="border-b py-2 select-none"
      style={{
        backgroundColor: themeMRA?.headerBg,
        color: themeMRA?.headerText,
        borderColor: "#d1d5db", // หรือใช้ theme ถ้ามี
      }}
    >
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
          <p>Medical Record Audit (11098)</p>
        </div>
        <div>
          <MRAThemeSelectorModal
            open={showThemeModal}
            onClose={() => setShowThemeModal(false)}
          />
          <Dropdown
            menu={{
              items,
            }}
            trigger={["click"]}
            getPopupContainer={(trigger) =>
              trigger.parentElement || document.body
            }
            className="font-sans"
          >
            <Avatar
              className="hover:cursor-pointer shadow hover:opacity-80 animate-fadeIn"
              src={profileImage ? profileImage : `/hospital/images/profile.jpg`}
              onClick={(e) => e.preventDefault()}
              size={40}
            />
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
