"use client"

import axios from "@/configs/axios.mjs";
import { redirect, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react"
import axiosGlobal from "axios";

export default function page() {
  const [department, setDepartment] = useState([]);
  const [prefix, setPrefix] = useState([]);
  const [position, setPosition] = useState([]);

  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect( () => {
    fetchDepartment();
    fetchPrefix();
    fetchPosition();
  }, [] )

  console.log(code)

  const fetchDepartment = async () => {
    try {
      const rs = await axios.get("/public/getDepartments");
      if(rs.status === 200){
        setDepartment(rs.data.data)
      }
    } catch (err) {
      console.log(err)
    }
  }
  const fetchPrefix = async () => {
    try {
      const rs = await axios.get("/public/getPrefixes");
      if(rs.status === 200){
        setPrefix(rs.data.data)
      }
    } catch (err) {
      console.log(err)
    }
  }
  const fetchPosition = async () => {
    try {
      const rs = await axios.get("/public/getPositions");
      if(rs.status === 200){
        setPosition(rs.data.data)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const dashBoard = [
    { no: "1", name: "แผนก", title: "", length: department.length },
    { no: "2", name: "คำนำหน้าชื่อ", title: "", length: prefix.length },
    { no: "3", name: "ตำแหน่ง", title: "", length: position.length },
  ]

  useEffect(() => {
    if (code) {
      postProvider();
    }
  }, [code]);

  const postProvider = async () => {
    try {

      const data = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "https://akathos.moph.go.th/hospital/admin",
        client_id: "9cdb0214-b2e8-41d7-919d-2efad2ee75f7",
        client_secret: "r5hEVsKSIYFdhhlpoMD0Sc3rTngO5h8Xvhl2Gaxc",
      })

      const rs = await axiosGlobal.post("https://moph.id.th/api/v1/token", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      })

      console.log(rs)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen bg-white rounded-xl p-4 shadow">
      <p className="mb-4">ข้อมูลล่าสุด</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {dashBoard.map((el, index) => (
          <div key={index} className="border border-gray-300 p-4 rounded-xl shadow hover:shadow-md transform transition-all duration-150">
            <p>{el.name}</p>
            <p>{el.length}</p>
          </div>
        ))}
      </div>

      <div className="border rounded px-2 pt-1.5 w-fit" >
        <a href="https://moph.id.th/oauth/redirect?client_id=9cdb0214-b2e8-41d7-919d-2efad2ee75f7&redirect_uri=https://akathos.moph.go.th/hospital/admin&response_type=code">ทดสอบ Provider ID</a>
      </div>
    </div>
  )
}
