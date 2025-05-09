"use client"

import axios from "axios";
import { createContext, useEffect, useState } from "react"

const GpsContext = createContext();
// ฟังก์ชันคำนวณระยะทาง (Haversine Formula)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // รัศมีโลก (กิโลเมตร)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // แปลงเป็นเมตร
};

// กำหนดตำแหน่งของสถานที่ และรัศมีของพื้นที่
const locations = [
    { id: 1, name: "โรงพยาบาลอากาศอำนวย", lat: 17.598248230864677, lon: 103.97421612776841, radius: 140, block: false }, // 140m
    { id: 2, name: "บ้านทอฝัน อากาศอำนวย", lat: 17.595159969402665, lon: 103.97170746966886, radius: 40, block: false }, // 40m
    { id: 3, name: "พื้นที่พิเศษ", lat: 17.6017161, lon: 103.9731508, radius: 250, block: false }, // 250m
    { id: 4, name: "พื้นที่พิเศษ สำหรับคอมพิวเตอร์ตั้งโต๊ะ", lat: 17.604722, lon: 103.9731508, radius: 250, block: false }, // 250m
    { id: 5, name: "พื้นที่เขตที่พัก-แฟลต", lat: 17.5952835301476, lon: 103.97090048028282, radius: 38, block: true }, // 38m
    { id: 6, name: "พื้นที่เขตที่พัก-แพทย์", lat: 17.597335000206414, lon: 103.97201531562511, radius: 80, block: true }, // 80m
    { id: 7, name: "พื้นที่เขตที่พัก-บ้านบุคลากร", lat: 17.59596028230156, lon: 103.97216262054967, radius: 50, block: true }, // 50m
];

const allowedIps = [
    "202.80.228.44",
];

function GpsContextProvider({ children }) {
    const [currentPosition, setCurrentPosition] = useState(null); // output example { lat: 17.6017161, lon: 103.9731508 }
    const [error, setError] = useState(null); // output "ข้อผิดพลาด : ข้อความที่ error"
    const [loading, setLoading] = useState(true); // output true | false
    const [locationStatus, setLocationStatus] = useState({ status: "error", name: "คุณอยู่นอกพื้นที่" }); // output { status: "error" | "success", name: "คุณอยู่นอกพื้นที่" | "พื้นที่ ที่กำหนด"}
    const [isFromTrustedNetwork, setIsFromTrustedNetwork] = useState(false); // จะเป็นจริงได้ก็ต่อเมื้อเราใช้เน็ต นอก รพ เท่านั้น ให้ใช้ตอนที่ locationStatus.status === "error" เท่านั้น!
  
    useEffect(() => {

        // ฟังก์ชันตรวจว่าเป็นมือถือหรือไม่
        const isMobileDevice = () => {
            return /Mobi|Android|iPhone/i.test(navigator.userAgent);
        };

        if (!navigator.geolocation) {
            setError("เบราว์เซอร์ของคุณไม่รองรับ GPS");
            setLoading(false);
            return;
        }
  
        let lastPosition = null;
        let lastTimestamp = null;

        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                setError(null); // รีเซ็ต error ถ้าอัปเดตตำแหน่งสำเร็จ
        
                const newPosition = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };
        
                const currentTime = Date.now();
        
                // ตรวจความแม่นยำของ GPS ความแม่นยำต้อง น้อยกว่า 100 ถึงผ่าน
                if (isMobileDevice() && position.coords.accuracy > 100) {
                    setLoading(false);
                    setError("GPS ไม่แม่นยำพอ อาจมีการ spoof หรือจำลองตำแหน่ง");
                    console.warn("Low GPS accuracy:", position.coords.accuracy);
                    return;
                }
        
                // ตรวจ jump ครั้งแรก (เริ่มจากตำแหน่งไกลผิดปกติ) ค่าเริ่มต้นที่ ระยะรัศมี 1 กม. คือ 1000 เมตร
                const initialCenter = { lat: 17.598248230864677, lon: 103.97421612776841 }; // โรงพยาบาล
                if (!lastPosition && haversineDistance(newPosition.lat, newPosition.lon, initialCenter.lat, initialCenter.lon) > 1000) {
                    setLoading(false);
                    setError("ตรวจพบว่าคุณเริ่มต้นจากตำแหน่งที่ไกลผิดปกติ อาจมีการ spoof GPS");
                    console.warn("Initial GPS spoofing suspected");
                    return;
                }
        
                // ตรวจจับการเคลื่อนไหวเร็วเกินไป
                if (lastPosition && lastTimestamp) {
                    const distanceMoved = haversineDistance(
                        lastPosition.lat,
                        lastPosition.lon,
                        newPosition.lat,
                        newPosition.lon
                    );
                    const timeElapsed = (currentTime - lastTimestamp) / 1000;
                    const speed = distanceMoved / timeElapsed;
        
                    if (speed > 50) {
                        setLoading(false);
                        setError("ตรวจพบความผิดปกติของตำแหน่ง GPS (เร็วเกินไป)");
                        console.warn("GPS spoofing detected: speed =", speed);
                        return;
                    }
                }
        
                lastPosition = newPosition;
                lastTimestamp = currentTime;
        
                setCurrentPosition(newPosition);
        
                // ตรวจสอบว่ายู่ในรัศมีของสถานที่ใดบ้าง
                const foundLocation = locations.find((location) => {
                    const distance = haversineDistance(
                        newPosition.lat,
                        newPosition.lon,
                        location.lat,
                        location.lon
                    );
                    return distance <= location.radius;
                });
        
                if (foundLocation) {
                    setLoading(false);
                    if (foundLocation.block) {
                        setLocationStatus({ status: "error", name: `ตำแหน่งของคุณถูกจำกัด (${foundLocation.name})` });
                    } else {
                        setLocationStatus({ status: "success", name: `คุณอยู่ใน ${foundLocation.name}` });
                    }
                } else {
                    setLocationStatus({ status: "error", name: "คุณอยู่นอกพื้นที่ที่กำหนด" });
                }
            },
            (err) => {
                setLoading(false);
                setError(`ข้อผิดพลาด : ${err.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );        
  
      return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    useEffect(() => {
        checkIP();
    }, []);

    const checkIP = async () => {
        try {
            const rs = await axios.get("https://api.ipify.org?format=json");
            setIsFromTrustedNetwork(allowedIps.includes(rs.data.ip));
        } catch (err) {
            console.error("IP fetch error:", err);
        };
    };
  
    const value = { currentPosition, error, loading, locationStatus, isFromTrustedNetwork };
  
    return <GpsContext.Provider value={value}>{children}</GpsContext.Provider>;
  }

export { GpsContextProvider };
export default GpsContext;