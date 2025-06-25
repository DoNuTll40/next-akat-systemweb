"use client"

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ButtonBackBefore() {
    const [isAuthen, setIsAuthen] = useState({});
    const router = useRouter();

    useEffect(() => {
      if (typeof window !== 'undefined') {
        if (localStorage.getItem("isAuthen")) {
          setIsAuthen(JSON.parse(localStorage.getItem("isAuthen")));
        }
      }
    }, [])

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else if (isAuthen?.status) {
      router.push(`/${isAuthen?.status?.toLowerCase()}`);
    } else {
      router.push("/auth/login");
    }

    return (
        <div className=" absolute top-5 left-5">
            <div className="border-2 p-2 rounded-full shadow-md drop-shadow-md hover:animate-pulse hover:cursor-pointer scale-100 active:scale-95 group" onClick={ () => router.back()}>
            <ChevronLeft className="scale-100 group-active:scale-95" strokeWidth={2.5} />
            </div>
        </div>
    )
}