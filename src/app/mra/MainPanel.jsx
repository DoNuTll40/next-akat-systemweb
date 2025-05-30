"use client";

import GpsHook from "@/hooks/GpsHook.mjs";

export default function MainPanel() {
    const { currentPosition, error, loading, locationStatus, isFromTrustedNetwork } = GpsHook();

    console.log(currentPosition)

    return (
        <div className="bg-white w-full h-[99%] rounded-lg flex justify-center items-center">
            <p>{loading ? "กำลังโหลดข้อมูลตำแหน่งของคุณ..." : locationStatus.name}</p>
            <p>{loading && currentPosition?.lat}</p>
            <p>{loading && currentPosition?.lon}</p>
        </div>
    );
}
