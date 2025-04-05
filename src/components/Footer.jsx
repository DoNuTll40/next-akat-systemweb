"use client"

import axios from "@/configs/axios.mjs"
import { Popover } from "antd"
import { BookUser } from "lucide-react"
import { Dialog } from "primereact/dialog"
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
      }
    } catch (err) {
      toast.error(err.response?.data?.message);
      setAllVersionDetail([])
    }
  };
  
  const latestVersion = allVersionDetail?.reduce((latest, current) => {
    return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
  }, allVersionDetail[0] || null);

  const content = (
    <ul>
      <li>{latestVersion?.api_version_detail_comment}</li>
    </ul>
  );

  const title = (
    <div className="flex gap-1 items-center text-md">
      <BookUser size={16} />
      <p>รายละเอียด</p>
    </div>
  )

  return (
    <div className="bg-white hidden w-full gap-2 md:flex justify-center items-center text-xs min-h-8 border-t border-gray-200 line-clamp-1">
      <p>&copy; Copyright 2025 โรงพยาบาลอากาศอำนวย</p>
      <Popover content={content} title={title}>
        <p>Version {latestVersion?.api_versions?.api_version_name}</p>
      </Popover>
    </div>
  )
}
