
"use client"

import GpsHook from "@/hooks/GpsHook.mjs";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const { error, loading, locationStatus } = GpsHook();

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

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex gap-2 flex-col w-full">
        <p className="text-center font-semibold text-lg">{locationStatus.name}</p>
        <p className="text-center font-semibold text-base text-red-600">{error}</p>
        <marquee behavior="" direction="">ระบบกำลังพัฒนา....</marquee>
      </div>
    </div>
  );
}
