"use client";

import { useState, useEffect, useRef } from "react";
import { InputOtp } from "primereact/inputotp";
import React from "react";
import AuthHook from "@/hooks/AuthHook.mjs";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import { Info } from "lucide-react";
import axios from "@/configs/axios.mjs";
import { useRouter } from "next/navigation";

export default function OtpInput() {
  const { showModalOtp, login, setShowModalOtp, verify, setInputLogin, user } = AuthHook();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [disabled, setDisabled] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const otpRef = useRef(null);
  
  const router = useRouter();
  
  useEffect(() => {
    if (otpRef.current && showModalOtp) {
      const firstInput = otpRef.current.querySelector("input");
      firstInput?.focus();
    }
  }, [showModalOtp]);  
  
  // เริ่มตัวจับเวลาเมื่อเปิด modal
  useEffect(() => {
    if (showModalOtp) {
      setTimeLeft(5 * 60); // รีเซ็ตเวลาใหม่เมื่อเปิด modal
      setDisabled(false); // เปิดให้กรอก OTP
    }
  }, [showModalOtp]); // เฉพาะเมื่อ openModalOtp เปลี่ยน

  // ตัวจับเวลาเมื่อเปิด modal
  useEffect(() => {
    if (showModalOtp) {
      if (timeLeft > 0) {
        const timer = setInterval(() => {
          setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
      } else {
        setDisabled(true);
      }
    }
  }, [timeLeft, showModalOtp]);  

  const hdlChange = (e) => {
    const newOtp = e.value;
    setOtp(newOtp);

    if (newOtp.length === 6) {
      sendOtpData(newOtp);
    }
  };

  const sendOtpData = async (otp) => {
    const output = { otpCode: otp };
    let token = localStorage.getItem("token")
    try {
      const rs = await axios.post("/auth/authVerifyOtp", output, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (rs.status === 200) {
        toast.success(rs.data?.message);
        setTimeLeft(5 * 60);
        setShowModalOtp(false);
        verify();
        setInputLogin({ username: "", password: "" })

        const status = user.status; // ป้องกัน null และทำเป็นตัวพิมพ์เล็กทั้งหมด

        console.log(status)

        if (status === "ADMIN") {
          router.push("/admin");
        } else if (status === "user") {
          router.push("USER");
        } else {
          router.push("/"); // fallback
        }
      }

    } catch (err) {
      toast.error(err.response?.data.message);
      setErrMsg(err.response?.data.message);
    }
  };

  // แปลงเวลาเป็น mm:ss
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const hdlResendOtp = async () => {
    try {
      const rs = await login();

      if(rs.status === 200){
        toast.success("ระบบทำการส่ง OTP ใหม่เรียบร้อยแล้ว");
        setTimeLeft(5 * 60);
        setDisabled(false);
        setErrMsg(null);
      }
    } catch (err) {
      toast.error(err.response?.data.message);
    }
  }

  const inputTemplate = ({ events, props }) => {
    return (
      <input
        key={props.id}
        {...events}
        {...props}
        type="text"
        autoComplete="off"
        className="p-inputotp-input p-inputtext p-component font-semibold text-lg p-filled select-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
    );
  };

  return (
    <>
      {showModalOtp && (
        <div className="fixed border h-screen w-screen bg-black/40 top-0 z-50 flex items-center justify-center p-4 select-none shadow-xl">
          <div className="font-sans bg-white/85 backdrop-blur-xl p-4 rounded-xl min-h-2/4 w-90 ">
            <div className="flex flex-col gap-2 my-4">
              <h1 className="text-center font-bold text-xl">กรอก OTP</h1>
              <p>
                ระบบได้ทำการส่งหมายเลข OTP ไปยังบัญชี Telegram
                ของคุณเป็นที่เรียบร้อยแล้วโปรตรวจสอบที่บัญชีของคุณ
              </p>
            </div>

            <div className="text-center text-black text-sm mb-4">
              {disabled ? (
                "หมดเวลา กรุณากดส่ง OTP อีกครั้ง"
              ) : (
                <p className="flex justify-center items-center gap-1">
                  OTP จะหมดอายุใน{" "}
                  <span className="px-2 bg-gray-300 rounded-sm font-sans font-semibold">
                    {formatTime(timeLeft)}
                  </span>{" "}
                  นาที
                </p>
              )}
            </div>

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

            <div className="flex justify-center" ref={otpRef}>
              <InputOtp
                length={6}
                integerOnly
                onChange={hdlChange}
                value={otp}
                inputTemplate={inputTemplate}
                invalid={otp.length === 6 ? "true" : undefined}
                disabled={disabled}
                unstyled={undefined}
              />
            </div>

            <div className="mt-12 flex justify-center">
              <Button
                disabled={!disabled}
                onClick={() => hdlResendOtp()}
                className="w-3/4 px-2 py-1.5 text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-full transition"
                label="ส่งอีกครั้ง"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
