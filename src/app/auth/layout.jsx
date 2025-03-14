"use client"

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function layout({children}) {

  const router = useRouter();

  return (
    <div className="flex justify-center w-full top-0 items-center h-screen px-4">
      <div className="w-96 bg-gray-50/80 border border-white backdrop-blur-md text-black shadow-lg hover:border-black/20 h-fit rounded-md p-4 transition-all transform ease-in-out duration-300">
        {children}
      </div>
    </div>
  )
}
