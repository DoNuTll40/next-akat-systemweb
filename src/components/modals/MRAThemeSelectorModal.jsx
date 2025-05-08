// components/modals/ThemeSelectorModal.jsx
"use client";

import { Modal, Button } from "antd";
import { useState } from "react";
import { MRAThemes } from "@/contexts/theme/MRATheme.mjs";
import MRAThemeHook from "@/hooks/MRAThemeHook.mjs";

export default function MRAThemeSelectorModal({ open, onClose }) {
  const { setThemeMRA } = MRAThemeHook();
  const [selected, setSelected] = useState(null);

  const handleSelect = (key) => {
    setSelected(key);
  };

  const handleApply = () => {
    if (selected) {
      setThemeMRA(MRAThemes[selected]);
      onClose();
    }
  };

  return (
    <Modal
      title="เลือกธีมสำหรับระบบ MRA"
      open={open}
      onCancel={onClose}
      onOk={handleApply}
      okButtonProps={{ disabled: !selected }}
      okText="ใช้ธีมนี้"
      cancelText="ยกเลิก"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(MRAThemes).map(([key, theme]) => (
          <div
            key={key}
            onClick={() => handleSelect(key)}
            className={`border rounded-xl p-4 transition-all duration-300 ease-in-out cursor-pointer shadow-sm hover:shadow-lg 
              ${selected === key ? "ring-2 ring-blue-500 border-blue-400 scale-105" : "hover:border-gray-300 bg-white"}`}
          >
            <div className="font-semibold text-base mb-2">{theme.name}</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded shadow-sm" style={{ backgroundColor: theme.headerBg, color: theme.headerText }}>
                Header
              </span>
              <span className="px-2 py-1 text-xs rounded shadow-sm" style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
                Footer
              </span>
              <span className="px-2 py-1 text-xs rounded shadow-sm" style={{ backgroundColor: theme.hoverBg }}>
                Hover
              </span>
              <span className="px-2 py-1 text-xs rounded shadow-sm" style={{ backgroundColor: theme.activeBg, color: theme.activeText }}>
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-6 p-4 rounded-lg border text-sm bg-gray-50">
          <p className="font-semibold mb-2">ตัวอย่างการใช้งานธีม:</p>
          <div
            className="rounded p-2 mb-2"
            style={{ backgroundColor: MRAThemes[selected].headerBg, color: MRAThemes[selected].headerText }}
          >
            Header ตัวอย่าง
          </div>
          <div
            className="rounded p-2 mb-2"
            style={{ backgroundColor: MRAThemes[selected].sidebarBg, color: MRAThemes[selected].sidebarText }}
          >
            Sidebar ตัวอย่าง
          </div>
          <div
            className="rounded p-2"
            style={{ backgroundColor: MRAThemes[selected].footerBg, color: MRAThemes[selected].footerText }}
          >
            Footer ตัวอย่าง
          </div>
        </div>
      )}
    </Modal>
  );
}
