"use client";

import AuthHook from "@/hooks/AuthHook.mjs";
import axios from "@/configs/axios.mjs";
import { ChevronLeft, EllipsisVertical, Lock, Unlock, X } from "lucide-react";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import AppHook from "@/hooks/AppHook.mjs";
import { Avatar, Input, Watermark } from "antd";
import { InputText } from "primereact/inputtext";

export default function ProfileModal() {
  const { setShowModalProfile } = AppHook();
  const { user } = AuthHook();
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [lock, setLock] = useState(true);
  const [chooseImage, setChooseImage] = useState(null)
  const [input, setInput] = useState({
    department_id: user?.departments?.department_id ,
    position_id: user?.positions.position_id,
    email: user?.email || '',
    fullname_thai: user?.fullname_thai || '',
    fullname_english: user?.fullname_english || '',
    image: ""
  });

  console.log(input)

  const fetchSignature = async () => {
    try {
      let token = localStorage.getItem("token");
      const rs = await axios.get("/auth/fetchSignature", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const blob = rs.data;
      const url = window.URL.createObjectURL(blob);
      setSignatureUrl(url); // เก็บ URL ใน state

      // ปล่อย URL เมื่อ component ถูก unmount
      return () => window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error fetching signature:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      let token = localStorage.getItem("token");

      const rs = await axios.get("/auth/fetchImage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      if (rs.status === 200) {
        const blob = rs.data;
        const url = window.URL.createObjectURL(blob);
        setProfileImage(url); // เก็บ URL ใน state
      }

      // ปล่อย URL เมื่อ component ถูก unmount
      return () => window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
      setProfileImage(null);
    }
  };

  useEffect(() => {
    fetchSignature();
    fetchProfile();
  }, []);

  const toggleLock = () => {
    setTimeout(() => {
      setLock(!lock);
    }, 250);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // setInput((prev) => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setChooseImage(url); // แสดงภาพที่เลือกทันที
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setInput((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file); // แปลงเป็น base64
    } else {
      setChooseImage(null);
      setInput((prev) => ({ ...prev, image: null }));
    }
  };

  const hdlSubmit = async () => {
    let token = localStorage.getItem("token");
    try {
      const rs = await axios.put("/auth/editUser", input, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if(rs.status === 200){
        console.log("success!")
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="fixed h-screen w-screen bg-black/40 top-0 z-50 flex flex-col items-center gap-2 justify-center p-4 select-none shadow-xl animate-fadeIn">
      <div className="font-sans bg-white/85 backdrop-blur-xl rounded-xl w-[360px] max-w-[90vw] max-h-[90vh] aspect-[360/560] flex animate-popUp overflow-hidden scale-90 md:scale-100">
        
        {/* card preview */}
        <div className="flex relative h-full w-full rounded-xl font-pridi">
          <img
            className={`absolute top-1 left-1 max-w-[70px] drop-shadow-lg z-10 ${lock ? "animate-fadeIn" : "animate-fadeOut"}`}
            src="/hospital/images/moph-sm.png"
            alt="logo"
          />

          <div className="bg-green-800 w-[13.5%] h-full flex items-center justify-center rounded-l-xl">
            <p className="-rotate-90 text-white text-2xl font-semibold tracking-wider whitespace-nowrap">
              AKATAMNUAY HOSPITAL
            </p>
          </div>
          <div className="w-[86.5%]">
            <div className="bg-green-800 h-13 rounded-tr-xl py-0.5 text-white">
              <p className="text-center font-semibold text-xl">
                โรงพยาบาลอากาศอำนวย
              </p>
              <p className="text-center font-semibold text-md">
                อ.อากาศอำนวย จ.สกลนคร
              </p>
            </div>
            <Watermark
              content={"โรงพยาบาลอากาศอำนวย"}
              rootClassName="font-sarabun"
              className={`font-sarabun h-[510px] ${lock ? "animate-fadeIn" : "animate-fadeOut"}`}
              
            >
              <div className="py-4 px-2 h-full flex justify-between flex-col font-sarabun bg-[#E9E9EB] rounded-br-xl">
                <div className="flex justify-center pointer-events-none">
                  <Avatar
                    shape="square"
                    size={200}
                    src={profileImage ? profileImage : `/hospital/images/profile.jpg`}
                  />
                </div>
                <div className="text-center">
                  <p className="font-black text-xl">{user.fullname_thai}</p>
                  <p className="text-lg font-semibold">
                    {user.positions?.position_name}
                  </p>
                  <p className="font-semibold">
                    {user.departments?.department_name}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div></div>
                  <div>
                    {signatureUrl ? (
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className="max-w-[200px] h-auto"
                      />
                    ) : (
                      <p>Loading signature...</p>
                    )}
                  </div>
                  <Button
                    className="w-fit"
                    onClick={toggleLock}
                    label={
                      lock ? (
                        <Lock strokeWidth={1} />
                      ) : (
                        <Unlock strokeWidth={1} />
                      )
                    }
                  />
                </div>
              </div>
            </Watermark>
          </div>
        </div>

        {/* card edit mode */}
        <div className={`bg-gray-200 absolute ${lock ? "left-90" : "left-0"} transition-all transform duration-500 ease-in-out h-full w-full rounded-xl`}>
          <div className="bg-green-800 h-13 rounded-t-xl py-0.5 text-white flex justify-between items-center">
            <Button className="p-4 rounded-tl-xl"
              onClick={toggleLock}
              label={
              <ChevronLeft />
              }
            />
            <div className="font-pridi">
              <p className="text-center font-medium text-xl">
                แก้ไขข้อมูลส่วยบุคคล
              </p>
            </div>
            <Button className="p-4 rounded-tr-xl"
              label={
              <EllipsisVertical />
              }
            />
          </div>
          <div className="p-4">
            <div className="w-full flex flex-col items-center justify-center gap-2 my-2">
              <div className="w-full grid grid-cols-2 gap-2">
                <Avatar className="w-1/2 drop-shadow-2xl text-2xl" shape="square" src={chooseImage ? chooseImage : profileImage ? profileImage : `/hospital/images/profile.jpg`} size={150} />
                <div className="w-full">
                  <div className="flex flex-col gap-1 my-2">
                    <p className="text-sm font-semibold">ชื่อไทย</p>
                    <Input size="large" className="shadow font-sarabun" value={input.fullname_thai} placeholder="email" />
                  </div>
                  <div className="flex flex-col gap-1 my-2">
                    <p className="text-sm font-semibold">ชื่ออังกฤษ</p>
                    <Input size="large" className="shadow font-sarabun" value={input.fullname_english} placeholder="email" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 my-2">
              <p className="text-sm font-semibold">เลือกรูปภาพ</p>
              <input className="bg-white file:border file:border-gray-300 file:py-1 file:px-2 file:rounded-md file:hover:cursor-pointer file:hover:bg-gray-200 shadow p-0.5 rounded-md w-full hover:cursor-pointer" type="file" accept="image/*" onChange={handleImageChange} placeholder="เลือกไฟล์" />
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-1 my-2">
                <p className="text-sm font-semibold">Email</p>
                <Input size="large" className="shadow" value={input.email} placeholder="email" />
              </div>
            </div>
          </div>
          <Button className="bg-green-800 p-4 rounded-md mx-auto" onClick={hdlSubmit} label="บันทึก" />
        </div>
      </div>
      <Button
        className="text-white p-2 rounded-full bg-black/10 outline-1 outline-offset-1 outline-black/10"
        label={<X />}
        onClick={() => setShowModalProfile(false)}
      />
    </div>
  );
}
