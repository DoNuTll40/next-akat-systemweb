'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { ClipboardList, Clock, Share, User } from 'lucide-react';
import axios from '@/configs/axios.mjs';
import { convertDateTime } from '@/services/convertDate';

import { Collapse } from 'antd';
import AuthHook from '@/hooks/AuthHook.mjs';
const { Panel } = Collapse; // Destructure Panel from Collapse

export default function AttendanceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
  const { user } = AuthHook();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  // ดึงข้อมูลจาก API
  const fetchData = async (accessToken) => {
    try {
      const rs = await axios.get(`/public/fetchAttendanceRecordsById/${Number(id)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (rs.status === 200) {
        setData(rs.data.data ? rs.data.data[0] : []); // ตรวจว่า rs.data.data เป็น object แล้วห่อเป็น array
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token") || "";
    setToken(tokenFromStorage);

    if (tokenFromStorage) {
      fetchData(tokenFromStorage);
    } else {
      toast.error("ไม่พบ token");
      router.replace("/auth/login");
    }
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0 && !data) {
      toast.error("ไม่พบข้อมูล");
      router.back();
    }

    console.log(window.history)
  }, [loading, data, data, router]);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (!data) return null;

  const handleShare = async () => {
    const shareData = {
      title: `รายละเอียดการลงเวลาของ ${data?.users?.prefixes?.prefix_name}${data?.users?.fullname_thai || 'พนักงาน'}`,
      text: `ดูรายละเอียดการลงเวลาของ ${data?.users?.fullname_thai || 'พนักงาน'} วันที่ ${new Date(data?.created_at).toLocaleDateString()}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        setSharing(true);
        await navigator.share(shareData);
      } catch (err) {
        console.error("แชร์ไม่สำเร็จ", err);
        toast.error("แชร์ไม่สำเร็จ");
      } finally {
        setSharing(false);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("คัดลอกลิงก์เรียบร้อยแล้ว");
      } catch (err) {
        toast.error("คัดลอกลิงก์ไม่สำเร็จ");
      }
    }
  };

  const hdlBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      router.push(`/${user?.status.toLowerCase()}/attendance/attendance-record`); // หรือ fallback ไปหน้าที่ต้องการ
    }
  };

  const collapseItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-1 text-sm font-bold text-gray-800">
          <User size={16} strokeWidth={3} className="text-gray-600" /> ข้อมูลทั่วไป
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm text-gray-700">
          <div><strong>ประเภทวัน:</strong> {data.shift_types?.shift_type_name || '-'}</div>
          <div><strong>กะ:</strong> {data.shifts?.shift_name || '-'}</div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-1 text-sm font-bold text-green-700">
          <Clock size={16} strokeWidth={3} className="text-green-700" /> รายละเอียดการเข้างาน
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm text-gray-700">
          <div><strong>เวลาเข้างาน:</strong> {data.starting}</div>
          <div><strong>สถานะเข้างาน:</strong> {data.check_in_status?.check_in_status_name || '-'}</div>

          {(data.location_lat_start && data.location_lon_start) && (
            <div className="col-span-full space-y-2">
              <div><strong>พิกัดเข้างาน:</strong> {data.location_lat_start}, {data.location_lon_start}</div>
              <div className="w-full h-64 rounded-md overflow-hidden shadow-md border border-gray-200">
                <iframe
                  // Corrected map URL - again, ensure this is correct for your Google Maps setup
                  src={`http://maps.google.com/maps?q=${data.location_lat_start},${data.location_lon_start}&t=p&z=17&ie=UTF8&iwloc=B&output=embed`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0 rounded-md"
                />
              </div>
            </div>
          )}

          {data.starting_signature_id && (
            <div className="col-span-full">
              <strong>ลายเซ็นเข้างาน:</strong>
              <Image
                src={`https://akathos.moph.go.th/api/public/signatureShowImage/${token}/${data.starting_signature_id}`}
                alt="ลายเซ็นเข้า"
                width={280}
                height={100}
                className="mt-2 border border-gray-300 rounded-md shadow-sm pointer-events-none select-none"
              />
            </div>
          )}

          {data.desc_start && (
            <div className="col-span-full"><strong>หมายเหตุเข้างาน:</strong> {data.desc_start}</div>
          )}
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-1 text-sm font-bold text-red-700">
          <Clock size={16} strokeWidth={3} className="text-red-700" /> รายละเอียดการออกงาน
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm text-gray-700">
          <div><strong>เวลาออกงาน:</strong> {data.ending}</div>
          <div><strong>สถานะออกงาน:</strong> {data.check_out_status?.check_out_status_name || '-'}</div>

          {(data.location_lat_end && data.location_lon_end) && (
            <div className="col-span-full space-y-2">
              <div><strong>พิกัดออกงาน:</strong> {data.location_lat_end}, {data.location_lon_end}</div>
              <div className="w-full h-64 rounded-md overflow-hidden shadow-md border border-gray-200">
                <iframe
                  // Corrected map URL - ensure this is correct for your Google Maps setup
                  src={`http://maps.google.com/maps?q=${data.location_lat_end},${data.location_lon_end}&t=p&z=17&ie=UTF8&iwloc=B&output=embed`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0 rounded-md"
                />
              </div>
            </div>
          )}

          {data.ending_signature_id && (
            <div className="col-span-full">
              <strong>ลายเซ็นออกงาน:</strong>
              <Image
                src={`https://akathos.moph.go.th/api/public/signatureShowImage/${token}/${data.ending_signature_id}`}
                alt="ลายเซ็นออก"
                width={280}
                height={100}
                className="mt-2 border border-gray-300 rounded-md shadow-sm pointer-events-none select-none"
              />
            </div>
          )}

          {data.desc_end && (
            <div className="col-span-full"><strong>หมายเหตุออกงาน:</strong> {data.desc_end}</div>
          )}
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <span className="flex items-center gap-1 text-sm font-bold text-gray-800">
          <ClipboardList size={16} strokeWidth={3} className="text-gray-600" /> ข้อมูลการบันทึก
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm text-gray-700">
          <div><strong>สร้างเมื่อ:</strong> {convertDateTime(data.created_at)}</div>
          <div><strong>สร้างโดย:</strong> {data.created_by || '-'}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 bg-white shadow-lg rounded-xl border border-gray-100">
      {/* Header Section */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-blue-900">
            รายละเอียดการลงเวลา
          </h1>
          <p className="mt-1 text-base font-medium text-gray-700">
            {data.users?.prefixes?.prefix_name || ''}{data.users?.fullname_thai || 'ไม่ระบุชื่อ'}
          </p>
        </div>

        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex items-center cursor-pointer gap-2 px-4 py-1.5 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sharing ? "กำลังแชร์..." : "แชร์"}
          <Share size={18} />
        </button>
      </div>

      <Collapse accordion defaultActiveKey="1" bordered items={collapseItems} />

      <button className='pt-2 pl-2 w-fit cursor-pointer text-sm' onClick={hdlBack}>ย้อนกลับ</button>
    </div>
  );
}
