"use client";

import AuthHook from "@/hooks/AuthHook.mjs";
import SideHook from "@/hooks/SideHook.mjs";
import { BookText, CalendarClock, ChevronDown, ChevronRight, CircleUser, House, LayoutDashboard, Lock, LockOpen, Minus, Settings, ShieldUser } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import Footer from "./Footer";

export default function SideBar() {
  const { user } = AuthHook();
  const { isOpen, isMini, toggleMini, openHamburger, toggleHamburger } = SideHook();
  const [onHover, setOnHover] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(null); // ใช้เพื่อตรวจสอบเมนูย่อยที่เปิดอยู่
  const [role, setRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // ข้อมูลเมนูสำหรับ admin และ user
  const adminSideBar = [
    {
      icon: <House size={22} strokeWidth={1} />,
      name: "หน้าหลัก",
      path: "/admin",
      title: "หน้าแรก",
    },
    {
      icon: <CircleUser size={22} strokeWidth={1} />,
      name: "หน้าต่างผู้ใช้งาน",
      path: "/user",
      title: "หน้าผู้ใช้ทั่วไป",
    },
    // {
    //   icon: <LayoutDashboard size={22} strokeWidth={1} />,
    //   name: "Dashboard",
    //   path: "/admin/dashboard",
    //   title: "แดชบอร์ด",
    //   submenu: [],
    // },
    {
      icon: <CalendarClock size={22} strokeWidth={1} />,
      name: "รายการลงเวลา",
      path: "/admin/attendance",
      title: "แดชบอร์ด",
      submenu: [
        { name: "ข้อมูลลงเวลา เข้า-ออก", path: "/admin/attendance/attendance-record" },
      ],
    },
    {
      icon: <Settings size={22} strokeWidth={1} />,
      name: "การตั้งค่า",
      path: "/admin/settings",
      title: "การตั้งค่า",
      submenu: [
        { name: "ข้อมูลชื่อสถานะเข้างาน", path: "/admin/settings/checkin", group: "ระบบลงเวลา" },
        { name: "ข้อมูลชื่อสถานะออกงาน", path: "/admin/settings/checkout", group: "ระบบลงเวลา" },
        { name: "เวลาเข้างาน", path: "/admin/settings/shift", group: "ระบบลงเวลา" },
        { name: "ประเภทวันเข้างาน", path: "/admin/settings/shift-type", group: "ระบบลงเวลา" },
        { name: "ตำแหน่งระบบลงเวลา", path: "/admin/settings/locations", group: "ระบบลงเวลา" },
        { name: "ข้อมูลวันหยุด", path: "/admin/settings/holiday", group: "ระบบลงเวลา" },
        { name: "ข้อมูลเวอร์ชั่น API", path: "/admin/settings/api-version", group: "เวอร์ชั่น" },
        { name: "ข้อมูลรายละเอียด API", path: "/admin/settings/api-details", group: "เวอร์ชั่น" },
        // { name: "ข้อมูลเวอร์ชั่นหน้าเว็บ", path: "/admin/settings/web-version", group: "เวอร์ชั่น" },
        // { name: "ข้อมูลรายละเอียดหน้าเว็บ", path: "/admin/settings/web-details", group: "เวอร์ชั่น" },
        // { name: "Carousel", path: "/admin/settings/carousel", group: "หน้าเว็บ" },
      ],
    },
  ];

  const userSideBar = [
    {
      icon: <House size={22} strokeWidth={1} />,
      name: "หน้าหลัก",
      path: "/user",
      title: "หน้าแรก",
    },
    {
      icon: <CalendarClock size={22} strokeWidth={1} />,
      name: "รายการลงเวลา",
      path: "/user/attendance",
      title: "แดชบอร์ด",
      submenu: [
        { name: "ข้อมูลลงเวลา เข้า-ออก", path: "/user/attendance/attendance-record" },
      ],
      department: [
        { department_id: 12 },
        { department_id: 15 }
      ],
      lock: <Lock size={15} strokeWidth={1} />,
      unLock: <LockOpen size={15} strokeWidth={1} />,
    },
    {
      icon: <BookText size={22} strokeWidth={1} />,
      name: "Medical Record Audit",
      path: "/mra",
      title: "Medical Record Audit",
      // status: "ADMIN",
      department: [
        { department_id: 26 },
        { department_id: 34 },
        { department_id: 41 }
      ],
      lock: <Lock size={15} strokeWidth={1} />,
      unLock: <LockOpen size={15} strokeWidth={1} />,
    },
    {
      icon: <ShieldUser size={22} strokeWidth={1} />,
      name: "ผู้ดูแลระบบ",
      path: "/admin",
      title: "หน้าแอดมิน",
      status: "ADMIN",
      lock: <Lock size={15} strokeWidth={1} />,
      unLock: <LockOpen size={15} strokeWidth={1} />,
    },
  ];

  // ดึง role จาก pathname
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = window.location.pathname.split("/")[2];
      setRole(role);
    }
  }, []);

  // ดึงสถานะ submenuOpen จาก localStorage และตรวจสอบ pathname เพื่อเปิดเมนูย่อยที่เกี่ยวข้อง
  useEffect(() => {
    if (typeof window !== "undefined") {
      // ดึงค่าจาก localStorage
      const savedSubmenu = localStorage.getItem("submenuOpen");
      const sideBar = role?.toLowerCase() === "admin" ? adminSideBar : userSideBar;

      // ตรวจสอบว่าเมนูย่อยใดควรเปิดตาม pathname
      let initialSubmenuOpen = savedSubmenu ? parseInt(savedSubmenu) : null;
      sideBar.forEach((item, index) => {
        if (item.submenu) {

          const isSubmenuActive = item.submenu.some((submenuItem) => pathname === submenuItem.path || pathname.startsWith(`${submenuItem.path}/`))
          if (isSubmenuActive) {
            initialSubmenuOpen = index;
          }

        }
      });

      setSubmenuOpen(initialSubmenuOpen);
    }
  }, [pathname, role]);

  // อัปเดต localStorage เมื่อ submenuOpen เปลี่ยน
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (submenuOpen !== null) {
        localStorage.setItem("submenuOpen", submenuOpen.toString());
      } else {
        localStorage.removeItem("submenuOpen");
      }
    }
  }, [submenuOpen]);

  const handleSubmenuToggle = (index) => {
    setSubmenuOpen(submenuOpen === index ? null : index);
  };

  const activeMenu = (role?.toLowerCase() === "admin" ? adminSideBar : userSideBar).reduce((prev, curr) => {
    return pathname.startsWith(curr.path) && curr.path.length > prev.path.length ? curr : prev;
  }, { path: "" });

  const isActive = (item) => item.path === activeMenu.path;

  const hasAccess = (item) => {
    if (item.status && user?.status !== item.status) return false;
    if (item.department && !item.department.some(dep => dep.department_id === user?.departments?.department_id)) return false;
    return true;
  };

  return (
    <>    
      <div
        className={`${isOpen ? (isMini ? `min-w-14 max-w-14 ${onHover ? "min-w-65 max-w-65" : ""}` : "min-w-65 max-w-65") : "min-w-0"} bg-white dark:bg-gray-800 dark:text-white hidden md:flex justify-between flex-col text-sm top-0 h-full left-0 transition-all duration-200 ease-in-out overflow-hidden`}
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
      >
        {isOpen && (
          <div className="pt-0 ml-1 h-fit overflow-hidden flex flex-col w-64 select-none">
            <div className={`bg-white rounded-md ${isMini && !onHover ? "max-w-[18%]" : ""}`}></div>
            <div className="my-2 mb-0.5 flex flex-col gap-1.5 overflow-auto sidebar">
              {(role?.toLowerCase() === "admin" ? adminSideBar : userSideBar).map((item, index) => (
                <div key={index}>
                  {item.submenu && item.submenu.length > 0 ? (
                    <button
                      className={`flex w-full justify-between items-center gap-2 p-2 pl-3 rounded-l-full transition hover:cursor-pointer
                        ${isActive(item) && !onHover && isMini ? "bg-gray-300" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmenuToggle(index);
                      }}
                    >
                      <div className="flex gap-1.5">
                        <span>{item.icon}</span>
                        <span className={`${isMini && !onHover && "hidden"}`}>{item.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {hasAccess(item) ? item.unLock : item.lock}
                        <ChevronDown
                          className={`transform transition-all ease-in-out duration-300 ${submenuOpen === index ? "-rotate-180" : ""}`}
                          size={16}
                          strokeWidth={1}
                        />
                      </div>
                    </button>
                  ) : (
                    <Link
                      href={item.path} // ลบการเช็ค submenu ออก เพราะถ้าไม่มี submenu ให้ไป path ตรงๆ
                      prefetch={false}
                      className={`flex justify-between items-center gap-2 p-2 pl-3 rounded-l-full transition 
                      ${isActive(item) ? "bg-gray-300" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                    >
                      <div className="flex gap-1.5" key={index}>
                        <span>{item.icon}</span>
                        <span className={`${isMini && !onHover && "hidden"}`}>{item.name}</span>
                      </div>
                      {hasAccess(item) ? item.unLock : item.lock}
                    </Link>
                  )}

                  {/* render submenu */}
                  {item.submenu && submenuOpen === index && (!isMini || onHover) && (
                    <div className="pl-4 shadow-inner shadow-gray-200 rounded-tl-2xl">
                      {Object.entries(item.submenu.reduce((acc, sub) => {
                        const group = sub.group || "null";
                        (acc[group] = acc[group] || []).push(sub);
                        return acc;
                      }, {})).map(([group, subs], gi) => (
                        <div key={gi} className="my-0.5">
                          {group !== "null" && <div className={`${gi === 0 && "pt-3" } text-sm font-semibold select-none text-gray-500 mt-1`}>{group}</div>}
                          {subs.map((sub, si) => (
                            <Link
                              key={si}
                              href={sub.path}
                              prefetch={false}
                              className={`flex p-2 pl-4 my-0.5 rounded-l-full transition ${pathname === sub.path || pathname.startsWith(`${sub.path}/`) ? "bg-gray-300" : "hover:bg-gray-200"}`}
                            >
                              - {sub.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* สิ้นสุดของการแสดง menu */}

                </div>
              ))}
            </div>
          </div>
        )}

        {isOpen && (
          <div
            className={`w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 hover:cursor-pointer min-h-8 flex ${isMini ? (onHover ? `justify-end` : `justify-center`) : "justify-end"}`}
            onClick={toggleMini}
          >
            <button className="dark:text-white px-2 hover:cursor-pointer focus:outline-0" aria-label={isMini ? "Expand sidebar" : "Collapse sidebar"}>
              <ChevronRight size={16} className={`${isMini ? " rotate-0 " : " rotate-180 "} transition-all transform ease-in-out duration-500`} />
            </button>
          </div>
        )}
      </div>

      {/* SideBar Mobile */}
      <div className={`${openHamburger ? "min-w-dvw" : "min-w-0"} bg-gray-300/70 backdrop-blur-sm fixed dark:bg-gray-800 h-[calc(100vh-51px)] dark:text-white flex md:hidden flex-col justify-between text-sm top-[3.2rem] left-0 transition-all duration-200 ease-in-out overflow-hidden z-50`}>
        {openHamburger && (
          <div className="p-2 h-fit overflow-hidden animate-fadeIn flex flex-col select-none w-full">
            <div className={`bg-white rounded-md max-w-[18%]`}></div>
            <div className="my-2 mb-0.5 flex flex-col gap-1.5 overflow-auto sidebar">
              {(role?.toLowerCase() === "admin" ? adminSideBar : userSideBar).map((item, index) => (
                <div key={index}>
                  {item.submenu && item.submenu.length > 0 ? (
                    <button
                      className={`flex w-full justify-between items-center gap-2 p-2 pl-3 rounded-full transition hover:cursor-pointer
                        ${isActive(item) ? "bg-gray-300" : "hover:bg-gray-100"}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmenuToggle(index);
                      }}
                    >
                      <div className="flex gap-1.5">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {hasAccess(item) ? item.unLock : item.lock}
                        <ChevronDown
                          className={`transform transition-all ease-in-out duration-300 ${submenuOpen === index ? "-rotate-180" : ""}`}
                          size={16}
                          strokeWidth={1}
                        />
                      </div>
                    </button>
                  ) : (
                    <Link
                      href={item.path} // ลบการเช็ค submenu ออก เพราะถ้าไม่มี submenu ให้ไป path ตรงๆ
                      prefetch={false}
                      onClick={toggleHamburger}
                      className={`flex justify-between items-center gap-2 p-2 pl-3 rounded-full drop-shadow-sm transition 
                      ${isActive(item) ? "bg-white" : "hover:bg-gray-100"}`}
                    >
                      <div className="flex gap-1.5" key={index}>
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {user?.status !== item.status ? item.lock : item.unLock}
                    </Link>
                  )}

                  {/* render submenu */}
                  {item.submenu && submenuOpen === index && (
                    <div className="border-t border-gray-50 mt-1">
                      {Object.entries(item.submenu.reduce((acc, sub) => {
                        const group = sub.group || "null";
                        (acc[group] = acc[group] || []).push(sub);
                        return acc;
                      }, {})).map(([group, subs], gi) => (
                        <div key={gi} className="my-0.5">
                          {group !== "null" && <div className={`${gi === 0 && "pt-1" } text-center text-sm font-semibold select-none text-gray-900 my-2`}>{group}</div>}
                          {subs.map((sub, si) => (
                            <Link
                              key={si}
                              onClick={toggleHamburger}
                              href={sub.path}
                              prefetch={false}
                              className={`flex p-2 pl-4 my-1 rounded-full drop-shadow-sm transition border-white border bg-white/60  ${pathname === sub.path || pathname.startsWith(`${sub.path}/`) ? "bg-white" : "hover:bg-gray-100"}`}
                            >
                              - {sub.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* สิ้นสุดของการแสดง menu */}

                </div>
              ))}
            </div>
          </div>
        )}

        {openHamburger && (
          <div
            className={`w-full bg-gray-300 text-xs flex items-center justify-center min-h-8`}
          >
            <p className="line-clamp-1">โรงพยาบาลอากาศอำนวย</p>
          </div>
        )}
      </div>
    </>
  );
}