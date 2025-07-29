"use client"

import MRAThemeHook from "@/hooks/MRAThemeHook.mjs";
import { Modal } from "antd";
import { BadgeCheck, CircleX, Eye, EyeClosed, X } from "lucide-react";
import Ripple from "material-ripple-effects";
import { useEffect, useState } from "react";


export default function ConfirmDeleteModal({ showModalDelete, setShowModalDelete, data, onConfirmDelete }) {
    const [inputConfirmAn, setInputConfirmAn] = useState("");
    const [anMatch, setAnMatch] = useState(true); // สถานะว่าตรงกันมั้ย
    const [inputPassword, setInputPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { themeMRA } = MRAThemeHook(); // เก็บค่า themeMRA ที่ได้จาก MRAThemeHook

    const ripple = new Ripple();

    const headerComponent = <p className="font-bold select-none">ยืนยันการลบ</p>;
    const footerComponent = <p className="text-xs text-center select-none">ผู้ใช้งาน {data?.created_by}</p>;

    useEffect(() => {
        setAnMatch(inputConfirmAn === data?.patients?.patient_an);
    }, [inputConfirmAn, data?.patients?.patient_an]);

    const maskAn = (an) => {
        if (!an || an.length < 4) return "*****";
        return "*****" + an.slice(-4);
    };

    const hdlCloseModal = () => {
        setShowModalDelete(false);
        setInputConfirmAn("");
    }

    useEffect(() => {
        if(!anMatch){
            setInputPassword("");
        }
    }, [anMatch])

    const handleConfirmDelete = async () => {
        setIsDeleting(true); // 🔄 เริ่มโหลด

        const isSuccess = await onConfirmDelete?.({
            confirmedAn: inputConfirmAn,
            password: inputPassword,
            originalAn: data?.patients?.patient_an,
        });

        setIsDeleting(false); // ✅ หรือ ❌ จบกระบวนการ

        if (isSuccess) {
            hdlCloseModal(); // ✅ ปิดเมื่อสำเร็จเท่านั้น
        }
    };

    return (
        <Modal 
            open={showModalDelete} 
            footer={footerComponent} 
            onCancel={hdlCloseModal} 
            title={headerComponent}
            className="select-none"
        >
            <p className="font-semibold text-sm">คุณต้องการลบข้อมูล ตัวอย่างหมายเลข AN {maskAn(data?.patients?.patient_an)} หรือไม่?</p>
            <p>กรอกหมายเลข AN ตรวจสอบความถูกต้อง</p>
            <div className="w-full flex justify-between items-center">
                <input 
                    className="bg-white border mt-1 text-gray-900 text-sm rounded-lg focus:ring ring-offset-1 block w-[90%] px-2.5 py-1.5"
                    type="phone" 
                    value={inputConfirmAn} 
                    onChange={(e) => setInputConfirmAn(e.target.value)} 
                    style={{
                        borderColor: inputConfirmAn === "" ? themeMRA?.activeBg : anMatch ? themeMRA?.activeBg : "red",
                        "--tw-ring-color": inputConfirmAn === "" ? themeMRA?.activeBg : anMatch ? themeMRA?.activeBg : "red",
                    }}
                    placeholder="AN"
                />
                {inputConfirmAn !== "" && ( anMatch ? ( <BadgeCheck className="mx-auto text-green-800" /> ) : ( <CircleX className="mx-auto text-red-700" /> ) )}
            </div>
            {anMatch && (
                <div className="w-full my-1.5">
                    <p>กรอกรหัสผ่าน</p>
                    <div className="relative">
                        <input 
                            className="bg-white border mt-1 text-gray-900 text-sm rounded-lg focus:ring ring-offset-1 block w-full px-2.5 py-1.5"
                            type={showPassword ? "text" : "password"} 
                            value={inputPassword}
                            style={{
                            borderColor: themeMRA?.activeBg,
                            "--tw-ring-color": themeMRA?.activeBg,
                            }}
                            onChange={(e) => setInputPassword(e.target.value)} 
                            placeholder="รหัสผ่าน"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer opacity-40 hover:opacity-100 ease-in-out duration-200">{showPassword ? <Eye onClick={() => setShowPassword(false)} size={18} /> : <EyeClosed onClick={() => setShowPassword(true)} size={18} />}</div>
                    </div>
                </div>
            )}

            <div className="flex gap-2 justify-start my-2">
                <button 
                    className="mt-2 border py-1 px-6 rounded-lg hover:font-semibold cursor-pointer disabled:hover:font-normal disabled:cursor-not-allowed disabled:opacity-50 scale-100 active:scale-[99%] disabled:active:scale-100"
                    disabled={!anMatch || inputPassword === "" || isDeleting}
                    onMouseUp={(e) => ripple.create(e, "light")}
                    onClick={handleConfirmDelete}
                    style={{
                        backgroundColor: themeMRA?.headerTableBg,
                        color: themeMRA?.textHeaderTable,
                        borderColor: themeMRA?.headerTableBg
                    }}
                    >{isDeleting ? "กำลังลบ..." : "ยืนยันการลบ"}</button>
                <button 
                    className="mt-2 border py-1 px-6 rounded-lg hover:font-semibold cursor-pointer scale-100 active:scale-[99%]" 
                    onClick={hdlCloseModal}
                    onMouseUp={(e) => ripple.create(e, "light")}
                    style={{
                        // backgroundColor: themeMRA.headerTableBg,
                        color: themeMRA?.activeBg,
                        borderColor: themeMRA?.headerTableBg
                    }}
                    >ยกเลิก</button>
            </div>
        </Modal>
    )
}
