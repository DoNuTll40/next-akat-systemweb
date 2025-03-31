"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function Footer() {
  const [allVersionDetail, setAllVersionDetail] = useState([])
  const [versionDetail, setVersionDetail] = useState(null)

  useEffect(() => {
    fetchApi()
  }, [])
  
  const fetchApi = async () => {
    let token = localStorage.getItem("token");
    
    try {
      const rs = await axios.get("/setting/getApiVersionDetails", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (rs.status === 200) {
        setAllVersionDetail(rs.data.data);
        setVersionDetail(latestVersion);
        console.log(allVersionDetail)
      }
    } catch (err) {
      toast.error(err.response?.data?.message);
      setAllVersionDetail([])
    }
  };
  
  const latestVersion = allVersionDetail?.reduce((latest, current) => {
    return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
  }, allVersionDetail[0] || null);

  return (
    <div className="bg-white hidden w-full gap-2 md:flex justify-center items-center text-xs min-h-8 border-t border-gray-200">
      <p className="line-clamp-1">&copy; Copyright 2025 โรงพยาบาลอากาศอำนวย</p>
      {JSON.stringify(versionDetail)}
      <p>v 0.0.1</p>
    </div>
  )
}
