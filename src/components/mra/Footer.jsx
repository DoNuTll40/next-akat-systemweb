"use client"

import axios from "@/configs/axios.mjs"
import { convertDate } from "@/services/convertDate"
import { Popover, Timeline } from "antd"
import { BookUser } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import MRAThemeHook from "@/hooks/MRAThemeHook"

export default function Footer() {
  const [allVersionDetail, setAllVersionDetail] = useState([])
  const [versionDetail, setVersionDetail] = useState(null)
  const { themeMRA } = MRAThemeHook();

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

  // หาเวอร์ชั่นสูงสุด
  const latestVersion = allVersionDetail.reduce((max, current) => {
    const currentVersion = current.api_versions.api_version_name;
    return currentVersion > max ? currentVersion : max;
  }, allVersionDetail[0]?.api_versions?.api_version_name);

  // กรองข้อมูลเฉพาะเวอร์ชั่นล่าสุด
  const latestData = allVersionDetail.filter(item => item.api_versions?.api_version_name === latestVersion);

  // แปลง latestData ให้เป็นโครงสร้างที่ Timeline ต้องการ
  const contentVersionDetail = latestData.map((item) => ({
    color: "green",
    children: (
      <div className="max-w-[50vw] font-sarabun">{item.api_version_detail_comment} ({convertDate(item.updated_at)})</div>
    ),
  }));

  const content = (
    <Timeline items={contentVersionDetail} />
  );

  const title = (
    <div className="flex gap-1 items-center text-md">
      <BookUser size={16} />
      <p>รายละเอียด เวอร์ชั่น {latestVersion}</p>
    </div>
  )

  return (
    <div
      className="hidden w-full gap-2 md:flex justify-center items-center text-xs min-h-8 border-t line-clamp-1 hover:cursor-default"
      style={{
        backgroundColor: themeMRA?.footerBg,
        color: themeMRA?.footerText,
        borderColor: themeMRA?.footerBorder || themeMRA?.footerText || "#e5e7eb",
      }}
    >
      <p>Medical Record Audit | &copy; Copyright 2025 โรงพยาบาลอากาศอำนวย</p>
      <Popover content={content} title={title}>
        <p className="underline underline-offset-2 cursor-pointer">เวอร์ชั่น {latestVersion}</p>
      </Popover>
    </div>
  )
}