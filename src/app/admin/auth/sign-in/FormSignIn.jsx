"use client";

import axios from "@/configs/axios.mjs";
import { cryptoEncode } from "@/configs/crypto.mjs";
import { IdCard, Info, LogIn, Signature } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import SignaturePad from "signature_pad";

export default function FormSignIn() {
  const [loadingButton, setLoadingButton] = useState(false);
  const [input, setInput] = useState({
    national_id: "",
  });
  const [errMsg, setErrMsg] = useState("");
  const canvasRef = useRef(null);
  const [signaturePad, setSignaturePad] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1; // ใช้ DPI จริงของอุปกรณ์
  
    // ตั้งค่าขนาด canvas ตาม DPI ของจอ
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio); // ป้องกันภาพแตก
  
    const signature = new SignaturePad(canvas);
    setSignaturePad(signature);
  }, []);

  const clearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
  };

  const saveSignature = () => {
    if (signaturePad) {
      const dataUrl = signaturePad.toDataURL("image/svg+xml");
      console.log(dataUrl);
    }
  };

  const hdlSubmit = async (e) => {
    e.preventDefault();
    setLoadingButton(true);
    setErrMsg("");
    const hash = await cryptoEncode(input.national_id);

    const output = { national_id: hash };

    try {
      const rs = await axios.post("/auth/authRegister", output);

      if (rs.status === 200) {
        toast.success(rs.data.message);
        router.back();
      }
    } catch (err) {
      setErrMsg(err.response?.data.message);
      toast.error(err.response?.data.message);
    } finally {
      setLoadingButton(false);
    }
  };

  const hdlChange = (e) => {
    setErrMsg(null);
    setInput((prev) => setInput({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="mb-4 mt-2">
      {errMsg && (
        <div className="bg-red-700 rounded-md mb-2 mt-4 animate-popUp shadow">
          <div className="bg-red-200 ml-1.5 rounded-r-md pl-2">
            <p className="text-red-700 font-semibold text-sm py-2 flex items-start gap-1 drop-shadow-sm">
              <Info size={20} />
              {errMsg}
            </p>
          </div>
        </div>
      )}
      <form className="flex flex-col" onSubmit={hdlSubmit}>
        <div className="flex flex-col gap-1 my-2">
          <div className="flex gap-1 items-center">
            <IdCard size={20} strokeWidth={1} />
            <p>รหัสบัตรประชาชน</p>
          </div>
          <input
            name="national_id"
            value={input?.national_id}
            className="w-full rounded-md transition py-2 text-md md:text-sm"
            onChange={hdlChange}
            placeholder="รหัสบัตรประชาชน"
            minLength="13"
            maxLength="13"
            type="text"
            autoComplete=""
            required
          />
          <div className="flex flex-col items-center mt-2 gap-1">
            <div className="flex gap-1 items-center w-full">
              <Signature size={18} strokeWidth={1.5} />
              <p>กรุณาวาดลายเซ็น</p>
            </div>
            <canvas
              ref={canvasRef}
              className="w-full h-48 border rounded-md border-gray-500 bg-white"
            />
            <div className="flex gap-2 mt-2">
              <Button className="px-4 py-1.5 border border-gray-500 rounded-full " type="button" onClick={clearSignature} label="ล้างลายเซ็น" />
              <Button className="px-4 py-1.5 border border-gray-500 rounded-full " type="button" onClick={saveSignature} label="บันทึกลายเซ็น" />
            </div>
          </div>
        </div>
        <div className="mt-8 mb-2">
          <Button
            className="border w-full rounded-full py-2 bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white transition"
            type="submit"
            disabled={loadingButton}
            label={
              <div className="flex items-center justify-center gap-1 font-semibold animate-fadeIn">
                {loadingButton ? (
                  <>
                    <span className="border-gray-300 h-6 w-6 animate-spin rounded-full border-3 border-t-blue-900"></span>
                  </>
                ) : (
                  <>
                    <LogIn strokeWidth={3} size={16} />
                    <p>ยืนยัน</p>
                  </>
                )}
              </div>
            }
          />
        </div>
        <Link
          className="text-center text-xs mt-5 hover:underline underline-offset-2 hover:text-blue-800 transition"
          href={"/admin/auth/login"}
        >
          ย้อนกลับ
        </Link>
      </form>
    </div>
  );
}
