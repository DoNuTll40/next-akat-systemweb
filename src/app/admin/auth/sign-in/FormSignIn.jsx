"use client";

import axios from "@/configs/axios.mjs";
import { cryptoEncode } from "@/configs/crypto.mjs";
import { Dot, IdCard, Info, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { useState } from "react";
import { toast } from "react-toastify";
import { Modal, Steps } from "antd"; // ✅ import modal + steps

const { Step } = Steps;

export default function FormSignIn() {
  const [loadingButton, setLoadingButton] = useState(false);
  const [showSteps, setShowSteps] = useState(false); // ✅ ควบคุม Modal
  const [input, setInput] = useState({
    national_id: "",
  });
  const [errMsg, setErrMsg] = useState("");
  const router = useRouter();

  const hdlSubmit = async (e) => {
    e.preventDefault();
    setLoadingButton(true);
    setErrMsg("");
    const hash = await cryptoEncode(input.national_id);

    const output = { national_id: hash };

    try {
      const rs = await axios.post("/auth/authRegister", output);

      if (rs.status === 200) {
        toast.success(rs.data.message);
        router.back();
      }
    } catch (err) {
      setErrMsg(err.response?.data.message);
      toast.error(err.response?.data.message);
    } finally {
      setLoadingButton(false);
    }
  };

  const hdlChange = (e) => {
    setErrMsg(null);
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="mb-4 mt-2">
      {/* ✅ Modal แสดงขั้นตอน */}
      <Modal
        title={<p className="font-black">ขั้นตอนการลงทะเบียนผู้ใช้งาน</p>}
        open={showSteps}
        onCancel={() => setShowSteps(false)}
        footer={null}
        centered
        className="font-sarabun select-none"
      >
        <Steps
          direction="vertical"
          size="small"
          current={-1} // ✅ ไม่เน้นขั้นไหนพิเศษ
        >
          <Step
            title=" เพิ่ม BotAkat"
            description={
              <>
                <p className="mb-2">
                  ต้องเพิ่ม BotAkat เป็นเพื่อนบนแอพ Telegram สามารถสแกน QRCode
                  เพื่อเพิ่มบอท หรือ{" "}
                  <span className="font-semibold underline text-blue-700">
                    คลิกที่ภาพ
                  </span>{" "}
                  ได้เลย
                </p>
                <div className="w-full flex justify-center my-2">
                  <button
                    onClick={() =>
                      window.open("https://t.me/NOOAKAGBOT", "_blank")
                    }
                    className="p-0 border-0 bg-transparent cursor-pointer w-fit"
                  >
                    <img
                      src="/hospital/images/scan-bot-akat.png"
                      alt="QR BotAkat"
                      className="w-[160px] md:w-[200px] select-none"
                      draggable={false} // ✅ ป้องกันลาก
                    />
                  </button>
                </div>
              </>
            }
            status="process"
          />
          <Step
            title=" ทักแชท BotAkat"
            description="สามารถส่งข้อความหรือสติกเกอร์ก็ได้ เป็นอันเสร็จ"
            status="process"
          />
          <Step
            title=" กรอกเลขบัตรประชาชน"
            description="กรอกเลขบัตรประชาชนที่หน้าเว็บ แล้วกด ยืนยัน ก็เสร็จสิ้นขั้นตอน หลังจากนั้น กดเข้าสู่ระบบ แล้วสามารถนำ username/password จากระบบ backoffice มาใช้ได้เลย"
            status="process"
          />
        </Steps>
      </Modal>

      {/* หัวข้อ + ปุ่มเปิด modal */}
      <div className="flex items-center justify-between mt-4 mb-2 text-sm text-gray-700">
        <div className="flex items-center gap-2 w-9/12">
          {/* <Dot size={16} className="text-green-800" /> */}
          <span className="font-semibold text-gray-800">
            อ่านขั้นตอนการลงทะเบียนผู้ใช้งานอย่างละเอียดก่อนเริ่มใช้งานระบบ
          </span>
        </div>
        <Button
          className="bg-white w-3/12 text-green-800 border border-green-700 hover:bg-green-50 px-3 py-1 text-xs font-medium rounded-md transition-all duration-200"
          icon="pi pi-eye"
          label="ดูขั้นตอน"
          onClick={() => setShowSteps(true)}
        />
      </div>

      {errMsg && (
        <div className="bg-red-700 rounded-md mb-2 mt-2 animate-popUp shadow">
          <div className="bg-red-200 ml-1.5 rounded-r-md pl-2">
            <p className="text-red-700 font-semibold text-sm py-2 flex items-start gap-1 drop-shadow-sm">
              <Info size={20} />
              {errMsg}
            </p>
          </div>
        </div>
      )}

      <form className="flex flex-col" onSubmit={hdlSubmit}>
        <div className="flex flex-col gap-1 my-2">
          <div className="flex gap-1 items-center">
            <IdCard size={20} strokeWidth={1} />
            <p>รหัสบัตรประชาชน</p>
          </div>
          <input
            name="national_id"
            value={input?.national_id}
            className="w-full rounded-md transition py-2 text-md md:text-sm"
            onChange={hdlChange}
            placeholder="รหัสบัตรประชาชน"
            minLength="13"
            maxLength="13"
            type="text"
            autoComplete=""
            required
          />
        </div>

        <div className="mt-8 mb-2">
          <Button
            className="border w-full rounded-full py-2 bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white transition"
            type="submit"
            disabled={loadingButton}
            label={
              <div className="flex items-center justify-center gap-1 font-semibold animate-fadeIn">
                {loadingButton ? (
                  <>
                    <span className="border-gray-300 h-6 w-6 animate-spin rounded-full border-3 border-t-blue-900"></span>
                  </>
                ) : (
                  <>
                    <LogIn strokeWidth={3} size={16} />
                    <p>ยืนยัน</p>
                  </>
                )}
              </div>
            }
          />
        </div>

        <Link
          className="text-center text-xs mt-5 hover:underline underline-offset-2 hover:text-blue-800 transition"
          href={"/admin/auth/login"}
        >
          เข้าสู่ระบบ
        </Link>
      </form>
    </div>
  );
}
