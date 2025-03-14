"use client"

import { Eye, EyeOff, LogIn, RectangleEllipsis, UserRound } from "lucide-react";
import { Button } from "primereact/button";
import { useState } from "react";

export default function FormLogin() {

    const [showPassword, setShowPassword] = useState(false);

    const hdlSubmit = (e) => {
        try {
            e.preventDefault();
        } catch (err) {
            console.log(err);
        };
    };

    return (
        <div className="mb-4 mt-2">
            <form className="flex flex-col" onSubmit={hdlSubmit}>
                <div className="flex flex-col gap-1 my-2">
                    <div className="flex gap-1 items-center">
                        <UserRound size={20} strokeWidth={1} />
                        <p>ชื่อผู้ใช้งาน</p>
                    </div>
                    <input className="w-full rounded-md transition py-2 text-md md:text-sm" placeholder="ชื่อผู้ใช้งาน" type="text" />
                </div>
                <div className="flex flex-col gap-1 my-2">
                    <div className="flex gap-1 items-center">
                        <RectangleEllipsis size={20} strokeWidth={1} />
                        <p>รหัสผ่าน</p>
                    </div>
                    <div className="relative">
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 select-none hover:cursor-pointer" onClick={ () => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={20} strokeWidth={1} /> : <Eye size={20} strokeWidth={1} />}
                        </div>
                        <input className="w-full rounded-md transition py-2 text-md md:text-sm" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;" type={showPassword ? "text" : "password"} />
                    </div>
                </div>
                <div className="mt-8 mb-2">
                    <Button className="border w-full rounded-md py-2 bg-green-800 hover:bg-green-700 text-white transition" type="submit" label={
                        <div className="flex items-center justify-center gap-1 font-semibold">
                            <LogIn strokeWidth={3} size={16} />
                            <p>ยืนยัน</p>
                        </div>
                    } />
                </div>
            </form>
        </div>
    )
}
