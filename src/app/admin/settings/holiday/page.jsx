"use client";

import axios from "@/configs/axios.mjs";
import { convertDateTime } from "@/services/convertDate";
import { Empty, Table } from "antd";
import { ListChecks, RefreshCcw } from "lucide-react";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import moment from "moment/moment"

export default function Page() {
  const [data, setData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sysStatus, setSysStatus] = useState(false);

  const baseUrlApi = axios.defaults.baseURL;

  useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.get("/setting/getHolidays", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (rs.status === 200) {
        setData(rs.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const dataSource = data.map((item, index) => ({
    ...item,
    index: index + 1,
  }));

  const columns = [
    {
      title: "ID",
      dataIndex: "index",
      sorter: (a, b) => a.index - b.index,
      responsive: ["md"],
      ellipsis: true,
      width: "5rem",
    },
    {
      title: "วัน",
      dataIndex: "holiday_name",
      sorter: (a, b) => a.holiday_name.localeCompare(b.holiday_name),
      ellipsis: true,
    },
    {
      title: "วันที่",
      dataIndex: "holiday_date",
      render: (date) => moment(date).add("years", 543).format("DD/MM/YYYY"),
      sorter: (a, b) => a.holiday_date.localeCompare(b.holiday_date),
      ellipsis: true,
    },
    {
      title: "สร้างโดย",
      dataIndex: "created_by",
      responsive: ["lg"],
      sorter: (a, b) => a.created_by.localeCompare(b.created_by),
      ellipsis: true,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "created_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      ellipsis: true,
    },
    {
      title: "อัพเดทโดย",
      dataIndex: "updated_by",
      responsive: ["lg"],
      sorter: (a, b) => a.updated_by.localeCompare(b.updated_by),
      ellipsis: true,
    },
    {
      title: "วันที่อัพเดท",
      dataIndex: "updated_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.updated_at.localeCompare(b.updated_at),
      ellipsis: true,
    },
  ];

  const hdlSignData = async () => {
    let token = localStorage.getItem("token");
    setMessages([]); // รีเซ็ตข้อความเก่า
    setSysStatus(true); // ตั้งค่า sysStatus เป็น true เพื่อให้แสดงสถานะกำลังทำงาน

    try {
      const response = await fetch(
        `${baseUrlApi}/setting/syncHolidays`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ key: "value" }),
        }
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let chunkData = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        chunkData += decoder.decode(value, { stream: true }); // เพิ่มข้อมูลที่อ่าน

        // ลบข้อมูลที่ไม่จำเป็นออก เช่น "data: "
        chunkData = chunkData.replace(/data:\s*/g, "");

        const dataRegex = /(\{.*\})/g; // ใช้ regex เพื่อจับข้อมูล JSON

        let match;

        // ตรวจจับ JSON ขนาดใหญ่
        while ((match = dataRegex.exec(chunkData)) !== null) {
          try {
            const jsonData = JSON.parse(match[0].trim()); // แปลงเป็น JSON

            if (jsonData.progress) {
              // ถ้า progress เป็น "complete" แสดงข้อความว่า "ซิ้งค์ข้อมูลสำเร็จ"
              if (jsonData.progress === "complete") {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  "ซิ้งค์ข้อมูลสำเร็จ",
                ]);
                fetchApi(); // เรียกฟังก์ชัน fetchApi เมื่อเสร็จสิ้น
              } else {
                // หากยังไม่เสร็จ แสดง progress
                setMessages((prevMessages) => [
                  ...prevMessages,
                  jsonData.progress,
                ]);
              }
            }
          } catch (error) {
            // หากพบข้อผิดพลาดในการแปลง JSON
            console.error("Error parsing chunk:", error);
          }
        }

        chunkData = ""; // รีเซ็ต chunkData หลังจากใช้เสร็จ
      }
    } catch (error) {
      console.error("Error fetching SSE:", error);
    } finally {
      setSysStatus(false); // ตั้งค่า sysStatus เป็น false เมื่อเสร็จสิ้นการทำงาน
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl select-none">

      {/* หัวข้อ */}
      <div className="my-1 font-semibold pl-1.5 bg-blue-900 rounded-md shadow-sm">
        <h1 className="bg-blue-50 p-2 pl-3 text-blue-900 flex gap-2 items-center">
          <ListChecks size={20} />
          ข้อมูลวันหยุดทั้งหมดที่มีในระบบ HosXP
        </h1>
      </div>

      <div className="flex justify-end my-1 p-2">
        <Button
          className="border py-1.5 px-4 rounded-md bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={sysStatus}
          onClick={() => hdlSignData()}
          label={
            <div className="flex items-center gap-1">
              <RefreshCcw
                className={` ${sysStatus && "animate-spin"}`}
                strokeWidth={3}
                size={16}
              />{" "}
              ซิ้งค์ข้อมูล
            </div>
          }
        />
      </div>

      {/* แสดงข้อความล่าสุด */}
      {messages.length > 0 && (
        <div className="flex gap-2 my-2">
          <h3>สถานะการซิ้งค์ข้อมูล</h3>
          {messages.length > 0 && <p>{messages[messages.length - 1]}</p>}
        </div>
      )}

      <hr className=" opacity-20" />

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="index"
        locale={{ emptyText: <Empty description={"ไม่พบข้อมูล"} /> }}
        scroll={{ x: 800 }}
        size="small"
        pagination={{
          pageSizeOptions: ["5", "10", "20", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 10,
          showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        }}
      />
    </div>
  );
}
