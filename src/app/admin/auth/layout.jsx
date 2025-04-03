"use client"

import OtpInput from "@/components/OtpInput"
import SettingSyncModal from "@/components/SettingSyncModal"
import { ServerCog } from "lucide-react"
import { useState } from "react"

export default function layout({children}) {

  const [showModalSync, setShowModalSync] = useState(false);

  const toggleModalSync = () => {
    setShowModalSync(!showModalSync)
  }

  return (
    <div className="flex justify-center w-full relative top-0 items-center min-h-screen px-4 py-4 bg-[url('https://5.imimg.com/data5/SELLER/Default/2021/8/LR/AP/SW/6976612/hospital-wallpaper.jpg')] bg-center bg-cover relative">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-xs z-0"></div>
      <OtpInput />
      <div className="w-96 bg-gray-50/85 border border-white backdrop-blur-xl text-black shadow-xl hover:border-black/20 h-fit rounded-2xl p-4 transition-all transform ease-in-out duration-300">
          <div className="select-none">
            <div className="flex gap-2 justify-center items-center my-2">
              <img className="max-w-[80px] pointer-events-none" src="/hospital/images/moph-sm.png" alt="logo" />
            </div>
            {children}
            <p className="text-center text-xs border-t border-gray-300 pt-2">&copy; Copyright 2025 โรงพยาบาลอากาศอำนวย</p>
          </div>
      </div>

      {showModalSync && <SettingSyncModal />}
      <div className=" absolute bottom-6 right-3 md:right-10 z-50 border p-3.5 outline outline-black/85 bg-black/85 rounded-full text-white hover:cursor-pointer hover:bg-black/70 duration-150 active:scale-95" onClick={toggleModalSync}>
        <ServerCog size={20} />
      </div>
    </div>
  )
}
