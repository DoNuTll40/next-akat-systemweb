
"use client"

import AuthHook from "@/hooks/AuthHook.mjs";
import GpsHook from "@/hooks/GpsHook.mjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = AuthHook();
  const { error, loading, locationStatus } = GpsHook();
  const router = useRouter();

  const [isFromTrustedNetwork, setIsFromTrustedNetwork] = useState(false);

  const allowedIps = [
    "202.80.228.44",
  ];

  useEffect( async () => {
    const rs = await axios.get("https://api.ipify.org?format=json")
    setIsFromTrustedNetwork(allowedIps.includes(rs.data.ip));
  }, [])

  if(loading){
    return (
      <div className="flex items-center justify-center h-dvh">
        <p>Loading... </p>
      </div>
    )
  }

  if(locationStatus.status === "error" && isFromTrustedNetwork){

    return (
      <div className="flex h-dvh justify-center items-center flex-col text-2xl">
        <p>{locationStatus.name}</p>
        <marquee>Out of Location</marquee>
      </div>
    )
  }

  if(user){
    let path = user.status.toLowerCase();
    router.push(`/${path}`);
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex gap-2 items-end flex-col w-full">
        <p>{locationStatus.name} {error}</p>
        <marquee behavior="" direction="">ระบบกำลังพัฒนา....</marquee>
      </div>
    </div>
  );
}
