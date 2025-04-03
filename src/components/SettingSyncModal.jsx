
import axios from "@/configs/axios.mjs";
import { RefreshCcw } from "lucide-react";
import { Button } from "primereact/button";
import { useState } from "react";
import { toast } from "react-toastify";

export default function SettingSyncModal() {

    const [statusLoadingDepartment, setStatusLoadingDepartment] = useState(false)
    const [statusErrDepartment, setStatusErrDepartment] = useState(false)
    const [statusLoadingPrefix, setStatusLoadingPrefix] = useState(false)
    const [statusErrPrefix, setStatusErrPrefix] = useState(false)
    const [statusLoadingPosition, setStatusLoadingPosition] = useState(false)
    const [statusErrPosition, setStatusErrPosition] = useState(false)

    const SyncDepartment = async () => {
        setStatusLoadingDepartment(true);
        setStatusLoadingPrefix(true)
        setStatusLoadingPosition(true)
        setStatusErrDepartment(false)
        setStatusErrPrefix(false)
        setStatusErrPosition(false)
        try {
            const rs = await axios.post("/publicApi/syncDepartments");
            if(rs.status === 200){
                SyncPrefix()
            }
        } catch (err) {
            console.log(err)
            setStatusErrDepartment(true)
            toast.error("เกิดข้อผิดพลาดในการซิ้งค์ข้อมูลแผนก")
        } finally {
            setStatusLoadingDepartment(false);
        }
    }

    const SyncPrefix = async () => {
        try {
            const rs = await axios.post("/publicApi/syncDataPrefixes");
            rs.status === 200 && SyncPosition()
        } catch (err) {
            console.log(err)
            setStatusErrPrefix(true)
            toast.error("เกิดข้อผิดพลาดในการซิ้งค์ข้อมูลคำนำหน้าชื่อ")
        } finally {
            setStatusLoadingPrefix(false)
        }
    }

    const SyncPosition = async () => {
        try {
            const rs = await axios.post("/publicApi/syncDataPositions");
            if(rs.status === 200){
                toast.success("ซิ้งค์ข้อมูลสำเร็จ")
            }
        } catch (err) {
            console.log(err)
            setStatusErrPosition(true)
            toast.error("เกิดข้อผิดพลาดในการซิ้งค์ข้อมูลตำแหน่ง")
        } finally {
            setStatusLoadingPosition(false)
        }
    }

  return (
    <div className="select-none fixed top-[20%] sm:top-[25%] left-1/2 -translate-x-1/2 sm:left-auto sm:-translate-x-0 sm:right-4 md:right-10 z-50 outline outline-offset-1 outline-black/95 py-4 px-5 bg-black/95 rounded-2xl min-h-[45vh] w-[90vw] max-w-[25rem] sm:w-[25rem] text-white animate-popUp overflow-y-auto max-h-[70vh]">
      <div className="flex gap-1 justify-between items-start">
        <div className="flex gap-1 items-center">
          <RefreshCcw size={18} />
          <h1>ระบบซิ้งค์ข้อมูล</h1>
        </div>
        <div className="text-xs flex flex-col items-end gap-1">
          <p>วันที่ซิ้งค์ข้อมูลล่าสุด</p>
          <p>2025-04-03</p>
        </div>
      </div>
      <hr className="my-2 text-white/30" />

      <div className="flex flex-col gap-6 justify-between">
        <div>

          <div className="border border-white/30 flex justify-between rounded-sm text-white w-full p-2 my-2">
            <div className="w-8/12">
              <p>ข้อมูล Department</p>
              <p className="text-sm mt-1 rounded-sm bg-[#2E2E2E] p-2 text-wrap">รายละเอียด : เป็นการดึงข้อมูลแผนกต่างๆ จากฐานข้อมูล</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-sm">สถานะ</p>
              <p className="text-xs">{statusLoadingDepartment ? "กำลังซิ้งค์ข้อมูล.." : statusErrDepartment ? "เกิดข้อผิดพลาด" : "ซิ้งค์ข้อมูลสำเร็จ"}</p>
            </div>
          </div>

          <div className="border border-white/30 flex justify-between rounded-sm text-white w-full p-2 my-2">
            <div className="w-8/12">
              <p>ข้อมูล Prefix</p>
              <p className="text-sm mt-1 rounded-sm bg-[#2E2E2E] p-2 text-wrap">รายละเอียด : เป็นการดึงข้อมูลคำนำหน้าชื่อ จากฐานข้อมูล</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-sm">สถานะ</p>
              <p className="text-xs">{statusLoadingPrefix ? "กำลังซิ้งค์ข้อมูล.." : statusErrPrefix ? "เกิดข้อผิดพลาด" : "ซิ้งค์ข้อมูลสำเร็จ"}</p>
            </div>
          </div>

          <div className="border border-white/30 flex justify-between rounded-sm text-white w-full p-2 my-2">
            <div className="w-8/12">
              <p>ข้อมูล Position</p>
              <p className="text-sm mt-1 rounded-sm bg-[#2E2E2E] p-2 text-wrap">รายละเอียด : เป็นการดึงข้อมูลตำแหน่งงานต่างๆ จากฐานข้อมูล</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-sm">สถานะ</p>
              <p className="text-xs">{statusLoadingPosition ? "กำลังซิ้งค์ข้อมูล.." : statusErrPosition ? "เกิดข้อผิดพลาด" : "ซิ้งค์ข้อมูลสำเร็จ"}</p>
            </div>
          </div>
        
        </div>

        <Button
          className="border border-white/30 py-1.5 w-full rounded-sm"
          label="ซิ้งค์ข้อมูล"
          onClick={SyncDepartment}
        />
      </div>
    </div>
  );
}
