"use client"

import ButtonBackBefore from "@/components/ButtonBackBefore";
import { useEffect } from "react";

export default function Forbidden() {

  useEffect(() => {
    document.title = "403 Forbidden"
  }, [])

  return (
    <div className='flex justify-center items-center h-screen select-none text-2xl font-semibold bg-gradient-to-l from-gray-200 via-gray-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <ButtonBackBefore />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-9xl font-bold font-notothai">403</h1>
          <p className="text-3xl font-bold">Forbidden</p>
          <p className="text-center text-base font-medium">You don't have permission to access this page.</p>
        </div>
    </div>
  );
}
