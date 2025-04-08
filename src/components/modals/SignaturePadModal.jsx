"use client";

import AuthHook from "@/hooks/AuthHook.mjs";
import axios from "axios";
import { Signature } from "lucide-react";
import { Button } from "primereact/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import SignaturePad from "signature_pad";

export default function SignaturePadModal() {
  const { verify } = AuthHook();
  const [signaturePad, setSignaturePad] = useState(null);
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1; // ใช้ DPI จริงของอุปกรณ์

    // ตั้งค่าขนาด canvas ตาม DPI ของจอ
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio); // ป้องกันภาพแตก

    const signature = new SignaturePad(canvas, {
      minWidth: 0.5, // ขนาดเส้นขั้นต่ำ
      maxWidth: 1.5, // ขนาดเส้นสูงสุด
      penColor: "black", // สีของปากกา
    });
    setSignaturePad(signature);
  }, []);

  const clearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
  };

  const saveSignature = async () => {
    // ตรวจสอบว่า canvas ว่างหรือไม่
    if (signaturePad.isEmpty()) {
      toast.error("กรุณาวาดลายเซ็นก่อนบันทึก"); // แจ้งเตือนถ้าไม่มีลายเซ็น
      return;
    }

    // เริ่ม toast loading
    const toastId = toast.loading("กำลังบันทึก...");

    setImage(null);
    if (signaturePad) {
      const dataUrl = signaturePad.toDataURL("image/svg+xml");

      // แปลง SVG เป็น PNG
      const img = new Image();
      img.src = dataUrl;
      img.onload = async function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width * 3; // เพื่อเพิ่มความละเอียด
        canvas.height = img.height * 3;

        ctx.imageSmoothingEnabled = true; // เปิดการทำให้ภาพคมชัด

        ctx.scale(3, 3); // ปรับความละเอียด
        ctx.drawImage(img, 0, 0);
        const pngBase64 = canvas.toDataURL("image/png");
        await sendSignature(pngBase64, toastId);
      };
    }
  };

  const sendSignature = async (pngBase64, toastId) => {
    try {
      let token = localStorage.getItem("token");

      const output = { signature_user_token: pngBase64 };

      const rs = await axios.post("/auth/generateSignature", output, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (rs.status === 200) {
        toast.update(toastId, {
          render: "บันทึกสำเร็จ",
          type: "success",
          isLoading: false,
          closeOnClick: true,
          autoClose: 2000,
        });
        verify();
      }
    } catch (err) {
      console.log(err);
      toast.update(toastId, {
        render: "เกิดข้อผิดพลาดในการบันทึก",
        type: "error",
        isLoading: false,
        closeOnClick: true,
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="fixed h-screen w-screen bg-black/40 top-0 z-50 flex items-center justify-center p-4 select-none shadow-xl animate-fadeIn">
      <div className="font-sans bg-white/85 backdrop-blur-xl p-4 rounded-xl w-96 animate-popUp">
        <div className="flex flex-col items-center mt-2 gap-1">
          <div className="flex gap-1 items-center justify-center w-full">
            <Signature size={18} strokeWidth={1.5} />
            <p className="text-lg font-semibold">กรุณาวาดลายเซ็น</p>
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-42 border rounded-md border-gray-500 bg-white"
          />
          <div className="flex gap-2 mt-2">
            <Button
              className="px-4 py-1.5 border-2 border-gray-500 hover:bg-yellow-100 hover:font-semibold hover:text-yellow-700 hover:border-yellow-700 rounded-full transform transition-all duration-200 hover:shadow-lg"
              type="button"
              onClick={clearSignature}
              label="ล้างลายเซ็น"
            />
            <Button
              className="px-4 py-1.5 border-2 border-gray-500 hover:bg-green-100 hover:font-semibold hover:text-green-700 hover:border-green-700 rounded-full transform transition-all duration-200 hover:shadow-lg"
              type="button"
              onClick={saveSignature}
              label="บันทึกลายเซ็น"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
