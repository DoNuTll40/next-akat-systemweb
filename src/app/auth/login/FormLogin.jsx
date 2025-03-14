"use client"

import { Eye, EyeOff, RectangleEllipsis, UserRound } from "lucide-react";
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
        <div className="my-4">
            <form onSubmit={hdlSubmit}>
                <div className="flex flex-col gap-1 my-2">
                    <div className="flex gap-1">
                        <UserRound strokeWidth={1} />
                        <p>ชื่อผู้ใช้งาน</p>
                    </div>
                    <input className="w-full rounded-md transition" placeholder="ชื่อผู้ใช้งาน" type="text" />
                </div>
                <div className="flex flex-col gap-1 my-2">
                    <div className="flex gap-1">
                        <RectangleEllipsis strokeWidth={1} />
                        <p>รหัสผ่าน</p>
                    </div>
                    <div className="relative">
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 select-none hover:cursor-pointer" onClick={ () => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={20} strokeWidth={1} /> : <Eye size={20} strokeWidth={1} />}
                        </div>
                        <input className="w-full rounded-md transition" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;" type={showPassword ? "text" : "password"} />
                    </div>
                </div>
                <div className="mt-8 mb-2">
                    <Button className="border w-full rounded-md py-1.5" type="submit" label="ยืนยีน" />
                </div>
            </form>
        </div>
    )
}
