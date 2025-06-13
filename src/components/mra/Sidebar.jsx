"use client";

import AuthHook from "@/hooks/AuthHook.mjs";
import SideHook from "@/hooks/SideHook.mjs";
import MRAThemeHook from "@/hooks/MRAThemeHook";
import {
  ClipboardList,
  FileText,
  ChevronDown,
  ChevronRight,
  Settings,
  LayoutDashboard,
  House,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MRASidebar() {
  const { user } = AuthHook();
  const { isOpen, isMini, toggleMini, openHamburger, toggleHamburger } =
    SideHook();
  const { themeMRA } = MRAThemeHook();
  const [onHover, setOnHover] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const pathname = usePathname();

  const sideMRA = [
    {
      icon: <House size={22} strokeWidth={1} />,
      name: "หน้าหลัก",
      path: "/mra",
    },
    // { icon: <LayoutDashboard size={22} strokeWidth={1} />, name: "แดชบอร์ด", path: "/mra/dashboard" },
    {
      icon: <ClipboardList size={22} strokeWidth={1} />,
      name: "แบบบันทึก",
      path: "/mra/form",
      submenu: [
        { name: "IPD", path: "/mra/form/ipd", group: "ฟอร์ม" },
        // { name: "OPD", path: "/mra/form/opd", group: "ฟอร์ม" },
      ],
    },
    // {
    //   icon: <FileText size={22} strokeWidth={1} />, name: "รายงาน", path: "/mra/reports",
    //   submenu: [
    //     { name: "รายงานการตรวจสอบ", path: "/mra/reports/summary", group: "รายงาน" },
    //     { name: "รายงานรายผู้ตรวจ", path: "/mra/reports/auditor", group: "รายงาน" },
    //   ]
    // },
    {
      icon: <Settings size={22} strokeWidth={1} />,
      name: "การตั้งค่า",
      path: "/mra/settings",
      submenu: [
        {
          name: "กลุ่มคนไข้",
          path: "/mra/settings/patient-services",
          group: "ระบบ",
        },
        {
          name: "หัวข้อฟอร์ม",
          path: "/mra/settings/content-record",
          group: "ระบบ",
        },
        {
          name: "overall-finding",
          path: "/mra/settings/overall-finding",
          group: "ระบบ",
        },
        {
          name: "review-status",
          path: "/mra/settings/review-status",
          group: "ระบบ",
        },
        // { name: "ข้อมูลเวอร์ชั่น", path: "/mra/settings/version", group: "ทั่วไป" },
      ],
    },
  ];

  useEffect(() => {
    const savedSubmenu = localStorage.getItem("mra-submenuOpen");
    let initialSubmenuOpen = savedSubmenu ? parseInt(savedSubmenu) : null;
    sideMRA.forEach((item, index) => {
      if (item.submenu) {
        const isSubmenuActive = item.submenu.some((sub) =>
          pathname.startsWith(sub.path)
        );
        if (isSubmenuActive) initialSubmenuOpen = index;
      }
    });
    setSubmenuOpen(initialSubmenuOpen);
  }, [pathname]);

  useEffect(() => {
    submenuOpen !== null
      ? localStorage.setItem("mra-submenuOpen", submenuOpen.toString())
      : localStorage.removeItem("mra-submenuOpen");
  }, [submenuOpen]);

  const handleSubmenuToggle = (index) => {
    setSubmenuOpen(submenuOpen === index ? null : index);
  };

  const activeMenu = sideMRA.reduce(
    (prev, curr) => {
      return pathname.startsWith(curr.path) &&
        curr.path.length > prev.path.length
        ? curr
        : prev;
    },
    { path: "" }
  );

  const isActive = (item) => item.path === activeMenu.path;

  return (
    <>
      <div
        className={`${
          isOpen
            ? isMini
              ? `min-w-14 max-w-14 ${onHover ? "min-w-65 max-w-65" : ""}`
              : "min-w-65 max-w-65"
            : "min-w-0"
        } 
          hidden md:flex justify-between flex-col text-sm top-0 h-full left-0 transition-all duration-200 ease-in-out overflow-hidden`}
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
        style={{
          backgroundColor: themeMRA?.sidebarBg,
          color: themeMRA?.sidebarText,
        }}
      >
        {isOpen && (
          <div className="pt-0 ml-1 h-fit overflow-hidden flex flex-col w-64 select-none">
            <div
              className={`rounded-md ${
                isMini && !onHover ? "max-w-[18%]" : ""
              }`}
            ></div>
            <div className="my-2 mb-0.5 flex flex-col gap-1.5 overflow-auto sidebar">
              {sideMRA.map((item, index) => (
                <div key={index}>
                  {item.submenu?.length > 0 ? (
                    <button
                      className={`flex w-full justify-between items-center gap-2 p-2 pl-3 rounded-l-full transition hover:cursor-pointer`}
                      style={{
                        backgroundColor: isActive(item)
                          ? themeMRA?.activeBg
                          : undefined,
                        color: isActive(item)
                          ? themeMRA?.activeText
                          : undefined,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmenuToggle(index);
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item))
                          e.currentTarget.style.backgroundColor =
                            themeMRA?.hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item))
                          e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      <div className="flex gap-1.5">
                        <span>{item.icon}</span>
                        <span className={`${isMini && !onHover && "hidden"}`}>
                          {item.name}
                        </span>
                      </div>
                      <ChevronDown
                        className={`transform transition-all ease-in-out duration-300 ${
                          submenuOpen === index ? "-rotate-180" : ""
                        }`}
                        size={16}
                        strokeWidth={1}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      prefetch={false}
                      className={`flex justify-between items-center gap-2 p-2 pl-3 rounded-l-full transition`}
                      style={{
                        backgroundColor: isActive(item)
                          ? themeMRA?.activeBg
                          : undefined,
                        color: isActive(item)
                          ? themeMRA?.activeText
                          : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item))
                          e.currentTarget.style.backgroundColor =
                            themeMRA?.hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item))
                          e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      <div className="flex gap-1.5">
                        <span>{item.icon}</span>
                        <span className={`${isMini && !onHover && "hidden"}`}>
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  )}

                  {item.submenu &&
                    submenuOpen === index &&
                    (!isMini || onHover) && (
                      <div className="pl-4 border-t rounded-tl-2xl">
                        {Object.entries(
                          item.submenu.reduce((acc, sub) => {
                            const group = sub.group || "null";
                            (acc[group] = acc[group] || []).push(sub);
                            return acc;
                          }, {})
                        ).map(([group, subs], gi) => (
                          <div key={gi} className="my-0.5">
                            {group !== "null" && (
                              <div
                                className={`text-sm font-semibold select-none mt-1 ${
                                  gi === 0 && "pt-3"
                                }`}
                              >
                                {group}
                              </div>
                            )}
                            {subs.map((sub, si) => (
                              <Link
                                key={si}
                                href={sub.path}
                                prefetch={false}
                                className={`flex p-2 pl-4 my-0.5 rounded-l-full transition`}
                                style={{
                                  backgroundColor:
                                    pathname === sub.path
                                      ? themeMRA?.activeBg
                                      : undefined,
                                  color:
                                    pathname === sub.path
                                      ? themeMRA?.activeText
                                      : undefined,
                                }}
                                onMouseEnter={(e) => {
                                  if (pathname !== sub.path)
                                    e.currentTarget.style.backgroundColor =
                                      themeMRA?.hoverBg;
                                }}
                                onMouseLeave={(e) => {
                                  if (pathname !== sub.path)
                                    e.currentTarget.style.backgroundColor = "";
                                }}
                              >
                                - {sub.name}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isOpen && (
          <div
            className={`w-full hover:cursor-pointer min-h-8 flex ${
              isMini
                ? onHover
                  ? "justify-end"
                  : "justify-center"
                : "justify-end"
            }`}
            style={{ backgroundColor: themeMRA?.hoverBg }}
            onClick={toggleMini}
          >
            <button
              className="dark:text-white px-2 hover:cursor-pointer focus:outline-0"
              aria-label={isMini ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight
                size={16}
                className={`transition-all transform ease-in-out duration-500 ${
                  isMini ? "rotate-0" : "rotate-180"
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* SideBar Mobile */}
      <div
        className={`${
          openHamburger ? "min-w-dvw" : "min-w-0"
        } bg-gray-300/70 backdrop-blur-sm fixed dark:bg-gray-800 h-[calc(100vh-51px)] dark:text-white flex md:hidden flex-col justify-between text-sm top-[3.2rem] left-0 transition-all duration-200 ease-in-out overflow-hidden z-50`}
      >
        {openHamburger && (
          <div className="pt-0 ml-1 h-fit overflow-hidden flex flex-col w-full select-none">
            <div className={`rounded-md max-w-[18%]`}></div>
            <div className="my-2 mb-0.5 flex flex-col gap-1.5 overflow-auto sidebar">
              {sideMRA.map((item, index) => (
                <div key={index}>
                  {item.submenu?.length > 0 ? (
                    <button
                      className={`flex w-full justify-between items-center gap-2 p-2 pl-3 rounded-l-full transition hover:cursor-pointer`}
                      style={{
                        backgroundColor: isActive(item)
                          ? themeMRA?.activeBg
                          : undefined,
                        color: isActive(item)
                          ? themeMRA?.activeText
                          : undefined,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmenuToggle(index);
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item))
                          e.currentTarget.style.backgroundColor =
                            themeMRA?.hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item))
                          e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      <div className="flex gap-1.5">
                        <span>{item.icon}</span>
                        <span>
                          {item.name}
                        </span>
                      </div>
                      <ChevronDown
                        className={`transform transition-all ease-in-out duration-300 ${
                          submenuOpen === index ? "-rotate-180" : ""
                        }`}
                        size={16}
                        strokeWidth={1}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      prefetch={false}
                      onClick={toggleHamburger}
                      className={`flex justify-between items-center gap-2 p-2 pl-3 rounded-l-full transition`}
                      style={{
                        backgroundColor: isActive(item)
                          ? themeMRA?.activeBg
                          : undefined,
                        color: isActive(item)
                          ? themeMRA?.activeText
                          : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item))
                          e.currentTarget.style.backgroundColor =
                            themeMRA?.hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item))
                          e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      <div className="flex gap-1.5">
                        <span>{item.icon}</span>
                        <span>
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  )}

                  {item.submenu &&
                    submenuOpen === index && (
                      <div className="border-t my-1">
                        {Object.entries(
                          item.submenu.reduce((acc, sub) => {
                            const group = sub.group || "null";
                            (acc[group] = acc[group] || []).push(sub);
                            return acc;
                          }, {})
                        ).map(([group, subs], gi) => (
                          <div key={gi} className="">
                            {group !== "null" && (
                              <div
                                className={`text-sm text-center font-semibold select-none ${
                                  gi === 0 && "pt-2"
                                }`}
                              >
                                {group}
                              </div>
                            )}
                            {subs.map((sub, si) => (
                              <Link
                                key={si}
                                href={sub.path}
                                prefetch={false}
                                onClick={toggleHamburger}
                                className={`flex p-2 pl-4 my-1 rounded-l-full transition border`}
                                style={{
                                  backgroundColor:
                                    pathname === sub.path
                                      ? themeMRA?.activeBg
                                      : undefined,
                                  color: 
                                  pathname === sub.path
                                      ? themeMRA?.activeText
                                      : undefined,
                                  borderColor: themeMRA?.activeText

                                }}
                                onMouseEnter={(e) => {
                                  if (pathname !== sub.path)
                                    e.currentTarget.style.backgroundColor =
                                      themeMRA?.hoverBg;
                                }}
                                onMouseLeave={(e) => {
                                  if (pathname !== sub.path)
                                    e.currentTarget.style.backgroundColor = "";
                                }}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
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
