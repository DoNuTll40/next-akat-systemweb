"use client"

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ButtonBackBefore() {

    const router = useRouter();

    return (
        <div className=" absolute top-5 left-5">
            <div className="border-2 p-2 rounded-full shadow-md drop-shadow-md hover:animate-pulse hover:cursor-pointer scale-100 active:scale-95 group" onClick={ () => router.back()}>
            <ChevronLeft className="scale-100 group-active:scale-95" strokeWidth={2.5} />
            </div>
        </div>
    )
}