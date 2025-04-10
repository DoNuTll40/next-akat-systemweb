"use client";

import AuthHook from "@/hooks/AuthHook.mjs";
import axios from "@/configs/axios.mjs";
import { Lock, X } from "lucide-react";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import AppHook from "@/hooks/AppHook.mjs";
import { Avatar, Watermark } from "antd";

export default function ProfileModal() {
  const { setShowModalProfile } = AppHook();
  const { user } = AuthHook();
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const fetchSignature = async () => {
    try {
      let token = localStorage.getItem("token");
      const rs = await axios.get(
        "/auth/fetchSignature",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

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
      let token = localStorage.getItem("token")

      const rs = await axios.get("/auth/fetchImage", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: "blob"
      })

      if(rs.status === 200){
        const blob = rs.data;
        const url = window.URL.createObjectURL(blob);
        setProfileImage(url); // เก็บ URL ใน state
      }

      // ปล่อย URL เมื่อ component ถูก unmount
      return () => window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err)
      setProfileImage(null)
    }
  }

  useEffect(() => {
    fetchSignature();
    fetchProfile();
  }, []);

  return (
    <div className="fixed h-screen w-screen bg-black/40 top-0 z-50 flex flex-col items-center gap-2 justify-center p-4 select-none shadow-xl animate-fadeIn">
      <div className="font-sans bg-white/85 backdrop-blur-xl rounded-xl w-90 h-[70vh] flex flex-col animate-popUp">
        <div className="flex relative h-full rounded-xl font-pridi">
          <img
            className="absolute top-1 left-1 max-w-[70px] drop-shadow-lg z-10"
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
            <Watermark content="โรงพยาบาลอากาศอำนวย" rootClassName="font-sarabun" className="font-sarabun">
            <div className="py-4 px-2 h-[63vh] flex justify-between flex-col font-sarabun bg-[#E9E9EB] rounded-br-xl">
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
                <Button className="w-fit" label={<Lock strokeWidth={1} />} />
              </div>
            </div>
            </Watermark>
          </div>
        </div>
      </div>
      <Button
        className="text-white p-2 rounded-full bg-black/10 outline-1 outline-offset-1 outline-black/10"
        label={<X />}
        onClick={ () => setShowModalProfile(false)}
      />
    </div>
  );
}
