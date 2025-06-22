'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { Share } from 'lucide-react';
import axios from '@/configs/axios.mjs';

export default function AttendanceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 bg-white shadow rounded-lg">
      <div className='flex justify-between items-center'>
        <h1 className="text-2xl font-semibold text-blue-900">รายละเอียดการลงเวลา</h1>

        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white rounded hover:opacity-80 cursor-pointer disabled:opacity-50"
        >
          {sharing ? "กำลังแชร์..." : "แชร์"}
          <Share size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div><strong>ชื่อพนักงาน:</strong> {data.users?.prefixes?.prefix_name} {data.users?.fullname_thai}</div>
        <div><strong>ประเภทวัน:</strong> {data.shift_types?.shift_type_name}</div>
        <div><strong>กะ:</strong> {data.shifts?.shift_name}</div>
        <div><strong>เริ่มงาน:</strong> {data.starting}</div>
        <div><strong>สถานะเข้างาน:</strong> {data.check_in_status?.check_in_status_name}</div>
        <div><strong>พิกัดเริ่ม:</strong> {data.location_lat_start}, {data.location_lon_start}</div>
        <div className="w-full h-64 rounded-md overflow-hidden">
          <iframe
            src={`https://maps.google.com/maps?width=600&height=400&hl=th&q=${data.location_lat_start},${data.location_lon_start}&t=p&z=17&ie=UTF8&iwloc=B&output=embed`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0 rounded-md"
          />
        </div>
        <div><strong>ลายเซ็นเข้า:</strong> 
          {data.starting_signature_id && (
            <Image
              src={`https://akathos.moph.go.th/api/public/signatureShowImage/${token}/${data.starting_signature_id}`}
              alt="ลายเซ็นเข้า"
              width={200}
              height={60}
              className="mt-1 border"
            />
          )}
        </div>
        <div><strong>หมายเหตุเข้า:</strong> {data.desc_start || "—"}</div>
        <div><strong>เลิกงาน:</strong> {data.ending}</div>
        <div><strong>สถานะออกงาน:</strong> {data.check_out_status?.check_out_status_name}</div>
        <div><strong>พิกัดเลิก:</strong> {data.location_lat_end}, {data.location_lon_end}</div>
        <div><strong>ลายเซ็นออก:</strong> 
          {data.ending_signature_id && (
            <Image
              src={`https://akathos.moph.go.th/api/public/signatureShowImage/${token}/${data.ending_signature_id}`}
              alt="ลายเซ็นออก"
              width={200}
              height={60}
              className="mt-1 border"
            />
          )}
        </div>
        <div><strong>หมายเหตุออก:</strong> {data.desc_end || "—"}</div>
        <div><strong>สร้างเมื่อ:</strong> {new Date(data.created_at).toLocaleString()}</div>
        <div><strong>อัปเดตเมื่อ:</strong> {new Date(data.updated_at).toLocaleString()}</div>
        <div><strong>สร้างโดย:</strong> {data.created_by}</div>
        <div><strong>อัปเดตโดย:</strong> {data.updated_by}</div>
      </div>
    </div>
  );
}
