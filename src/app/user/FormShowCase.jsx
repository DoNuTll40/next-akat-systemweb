"use client";

import axios from "@/configs/axios.mjs";
import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  LogOut,
  AlertTriangle,
  XCircle,
} from "lucide-react";

const iconMap = {
  "เข้างาน": <CheckCircle className="text-green-500" />,
  "มาสาย": <Clock className="text-yellow-500" />,
  "ออกก่อนเวลา": <AlertTriangle className="text-orange-500" />,
  "ออกงาน": <LogOut className="text-blue-500" />,
  "ไม่มีการเช็คออกงาน": <XCircle className="text-red-500" />,
};

export default function FormShowCase() {
  const [data, setData] = useState(null);

  const getData = async () => {
    const token = localStorage.getItem("token");

    try {
      const rs = await axios.get("/auth/fetchDataAll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (rs.status === 200) {
        setData(rs.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-6 py-2 sm:p-6">
        {data &&
          Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="bg-white border border-gray-200 rounded-xl w-full py-2 shadow transition-all duration-300 text-center select-none"
            >
              <div className="flex flex-col items-center">
                {iconMap[key] || (
                  <CheckCircle className="text-gray-400" />
                )}
                <div className="text-gray-800 font-medium text-sm mt-1 sm:text-lg">
                  {key}
                </div>
                <div className="text-xl sm:text-3xl font-bold text-blue-600 mt-1">
                  {value}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
