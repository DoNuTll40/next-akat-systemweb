"use client"

import axios from "@/configs/axios.mjs";
import { useEffect, useState } from "react"

export default function page() {
  const [department, setDepartment] = useState([]);
  const [prefix, setPrefix] = useState([]);
  const [position, setPosition] = useState([]);

  useEffect( () => {
    fetchDepartment();
    fetchPrefix();
    fetchPosition();
  }, [] )

  const fetchDepartment = async () => {
    try {
      const rs = await axios.get("/publicAPI/getDepartments");
      if(rs.status === 200){
        setDepartment(rs.data.data)
      }
    } catch (err) {
      console.log(err)
    }
  }
  const fetchPrefix = async () => {
    try {
      const rs = await axios.get("/publicAPI/getPrefixes");
      if(rs.status === 200){
        setPrefix(rs.data.data)
      }
    } catch (err) {
      console.log(err)
    }
  }
  const fetchPosition = async () => {
    try {
      const rs = await axios.get("/publicAPI/getPositions");
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
    </div>
  )
}
