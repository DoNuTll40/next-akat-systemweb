"use client"

import axios from "@/configs/axios.mjs";
import { cryptoEncode } from "@/configs/crypto.mjs";
import AuthHook from "@/hooks/AuthHook.mjs";
import { Spin } from "antd";
import { Eye, EyeOff, Info, LogIn, RectangleEllipsis, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "primereact/button";
import { useState } from "react";
import { toast } from "react-toastify";

export default function FormLogin() {
    const { login, inputLogin, setInputLogin, showModalOtp, setShowModalOtp, setToken, errMsg, setErrMsg } = AuthHook();
    const [showPassword, setShowPassword] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);

    const hdlSubmit = async (e) => {
        e.preventDefault();
        setLoadingButton(true)
        try {
            const rs = await login();

            if(rs.status === 200){
                toast.success("โปรดยืนยัน OTP")
                localStorage.setItem("token", rs.data.token);
                setToken(rs.data.token)
                setShowModalOtp(true)
            }
        } catch (err) {
            setErrMsg(err.response?.data.message)
            toast.error(err.response?.data.message)
        } finally {
            setLoadingButton(false)
        }
    };

    const hdlChange = (e) => {
        setErrMsg(null)
        setInputLogin((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    return (
        <div className="mb-4 mt-2">
            {errMsg && 
                <div className="bg-red-700 rounded-md mb-2 mt-4 animate-popUp shadow">
                    <div className="bg-red-200 ml-1.5 rounded-r-md pl-2">
                        <p className="text-red-700 font-semibold text-sm py-2 flex items-start gap-1 drop-shadow-sm">
                            <Info size={20} />
                            {errMsg}
                        </p>
                    </div>
                </div>
            }
            <form className="flex flex-col" onSubmit={hdlSubmit}>
                <div className="flex flex-col gap-1 my-2">
                    <div className="flex gap-1 items-center">
                        <UserRound size={20} strokeWidth={1} />
                        <p>ชื่อผู้ใช้งาน</p>
                    </div>
                    <input 
                        name="username"
                        value={inputLogin?.username}
                        className="w-full rounded-md transition py-2 text-md md:text-sm" 
                        onChange={hdlChange} 
                        placeholder="ชื่อผู้ใช้งาน" 
                        type="text" 
                        autoComplete="off"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1 my-2">
                    <div className="flex gap-1 items-center">
                        <RectangleEllipsis size={20} strokeWidth={1} />
                        <p>รหัสผ่าน</p>
                    </div>
                    <div className="relative">
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 select-none hover:cursor-pointer bg-white p-1" onClick={ () => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={20} strokeWidth={1} /> : <Eye size={20} strokeWidth={1} />}
                        </div>
                        <input 
                            name="password"
                            value={inputLogin?.password}
                            className="w-full rounded-md transition py-2 text-md md:text-sm" 
                            onChange={hdlChange} 
                            placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;" 
                            type={showPassword ? "text" : "password"} 
                            autoComplete="current-password"
                            required
                        />
                    </div>
                </div>
                <div className="mt-8 mb-2">
                    <Button className="border w-full rounded-full py-2 bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white transition" type="submit" disabled={loadingButton || showModalOtp} label={
                        <div className="flex items-center justify-center gap-1 font-semibold animate-fadeIn">
                            {loadingButton || showModalOtp ? 
                            <>
                                <span className='border-gray-300 h-6 w-6 animate-spin rounded-full border-3 border-t-blue-900'></span>
                            </>
                            :
                            <>
                                <LogIn strokeWidth={3} size={16} />
                                <p>ยืนยัน</p>
                            </>
                            }
                        </div>
                    } />
                </div>
                <Link className="text-center text-xs mt-5 hover:underline underline-offset-2 hover:text-blue-800 transition" href={"/admin/auth/sign-in"}>สร้างผู้ใช้งาน</Link>

            </form>
        </div>
    )
}
