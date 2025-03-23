"use client"

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "primereact/button";

export default function GenericModal({
  isOpen,
  onClose,
  onSubmit,
  fields,
  initialData = {},
  title = "Form Modal",
}) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
    setTimeout(() => {
      document.getElementById("input-1")?.focus();
    }, 100); // หน่วงเวลา 100ms
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
    onClose();
    setFormData({});
  };

  // Variants สำหรับ backdrop
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.3 },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  // Variants สำหรับ dialog
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const footerContent = (
    <div className="flex justify-end gap-2 font-semibold">
      <Button
        onClick={onClose}
        className="px-6 py-1.5 border border-gray-400 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        label="ยกเลิก"
      />
      <Button
        onClick={handleSubmit}
        className="px-6 py-1.5 border border-blue-800 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors"
        label="บันทึก"
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black z-10"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="h-full flex items-center justify-center p-4"
          >
            <Dialog
              visible={isOpen}
              onHide={onClose}
              header={<p className="font-semibold text-md">{title}</p>}
              footer={footerContent}
              className="w-full max-w-md bg-white p-4 rounded-xl mx-4"
            >
              <div className="py-4">
                {fields.map((field, index) => (
                  <div key={field.name} className="mb-4 mx-1">
                    <input
                      key={`input-${index + 1}`}
                      placeholder={field.label}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full text-[0.95rem] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </Dialog>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
