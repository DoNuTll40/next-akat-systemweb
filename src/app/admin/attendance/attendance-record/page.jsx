"use client";

import axios from "@/configs/axios.mjs";
import { convertDateTime } from "@/services/convertDate";
import { DatePicker, Empty, Table } from "antd";
import dayjs from "dayjs";
import dayTh from "dayjs/locale/th";
import th from "antd/es/date-picker/locale/th_TH";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { ChartNoAxesGantt, ExternalLink, RefreshCcw, Search, Sheet } from "lucide-react";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

dayjs.extend(buddhistEra);
dayjs.locale(dayTh);
 
const buddhistLocale = {
  ...th,
  lang: {
    ...th.lang,
    fieldDateFormat: "DD/MM/BBBB",
    fieldDateTimeFormat: "DD/MM/BBBB HH:mm:ss",
    yearFormat: "BBBB",
    cellYearFormat: "BBBB",
  },
};

export default function page() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const { RangePicker } = DatePicker;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errMsg, setErrMsg] = useState(null)

  useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.get("/publicAPI/fetchDataAllAttendanceRecord", {
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
  
  const hdlSearchInput = (e) => {
    setSearch(e.target.value)
  }
  
  // useEffect ของการค้นหา
  useEffect(() => {
    if(search === ""){
      fetchApi();
      setErrMsg(null)
    } else {
      searchApi();
    }
  }, [search])

  // เอาข้อมูลที่ได้มาเพิ่มลำดับ
  const dataSource = data.map((item, index) => ({
    ...item,
    index: index + 1,
  }));
  
  // ทำตัวเลือกใน filter จากข้อมูล
  const uniqueCheckInStatus = [...new Set(dataSource.map((item) => item?.check_in_status?.check_in_status_name))]
  .map((date) => ({
    text: date,
    value: date,
  }));

  // ทำตัวเลือกใน filter จากข้อมูล
  const uniqueCheckOutStatus = [...new Set(dataSource.map((item) => item?.check_out_status?.check_out_status_name)),
  ].map((date) => ({
    text: date || 'ไม่มีข้อมูล',
    value: date || 'ไม่มีข้อมูล',
  }));

  // ทำตัวเลือกใน filter จากข้อมูล
  const uniqueCheckShiftType = [...new Set(dataSource.map((item) => item?.shift_types?.shift_type_name)),
  ].map((date) => ({
    text: date || 'ไม่มีข้อมูล',
    value: date || 'ไม่มีข้อมูล',
  }));

  // สร้างหัวของตาราง
  const columns = [
    {
      title: "ID",
      dataIndex: "index", // ใช้ index แทน
      sorter: (a, b) => a.index - b.index,
      responsive: ["md"],
      ellipsis: true,
      width: "5rem"
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "users",
      sorter: (a, b) => a.users.fullname_thai.localeCompare(b.users.fullname_thai),
      ellipsis: true,
      render: (users) => (users ? `${users.prefix} ${users.fullname_thai}` : "-"),
    },
    {
      title: "เข้างาน",
      dataIndex: "check_in_status",
      sorter: (a, b) => a.check_in_status.check_in_status_name.localeCompare(b.check_in_status.check_in_status_name),
      ellipsis: true,
      render: (check_in_status) => check_in_status?.check_in_status_name || "-",
      filters: uniqueCheckInStatus,
      onFilter: (value, record) => record.check_in_status.check_in_status_name === value,
      width: "7rem"
    },
    {
      title: "เวลาเข้างาน",
      dataIndex: "starting",
      responsive: ["lg"],
      sorter: (a, b) => a.starting.localeCompare(b.starting),
      ellipsis: true,
      width: "7rem"
    },
    {
      title: "ออกงาน",
      dataIndex: "check_out_status",
      sorter: (a, b) => {
        // ตรวจสอบว่ามีข้อมูลหรือไม่ทั้ง a และ b
        if (!a.check_out_status?.check_out_status_name || !b.check_out_status?.check_out_status_name) return 0; 
        return a.check_out_status.check_out_status_name.localeCompare(b.check_out_status.check_out_status_name);
      },
      ellipsis: true,
      render: (check_out_status) => check_out_status?.check_out_status_name || "ไม่มีข้อมูล",
      filters: uniqueCheckOutStatus,
      onFilter: (value, record) => {
        return record.check_out_status?.check_out_status_name === value || (!record.check_out_status?.check_out_status_name && value === 'ไม่มีข้อมูล');
      },
      width: "7rem"
    },    
    {
      title: "เวลาออกงาน",
      dataIndex: "ending",
      responsive: ["lg"],
      sorter: (a, b) => {
        if (!a.ending || !b.ending) return 0; // ถ้าไม่มีข้อมูล ไม่ให้ทำการเรียงลำดับ
        return a.ending.localeCompare(b.ending); // ถ้ามีข้อมูล ก็ทำการเรียง
      },
      render: (ending) => ending || "ไม่มีข้อมูล",
      ellipsis: true,
      width: "7rem"
    },
    {
      title: "ประเภทวัน",
      dataIndex: "shift_types",
      responsive: ["lg"],
      sorter: (a, b) => a.shift_types.shift_type_name.localeCompare(b.shift_types.shift_type_name),
      render: (shift_types) => shift_types?.shift_type_name || "-",
      ellipsis: true,
      filters: uniqueCheckShiftType,
      onFilter: (value, record) => record.shift_types?.shift_type_name === value,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "created_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      ellipsis: true,
    },
    {
      title: "อัพเดทล่าสุด",
      dataIndex: "updated_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.updated_at.localeCompare(b.updated_at),
      ellipsis: true,
    },
  ];
  // สิ้นสุด

  // ฟังชั่นสำหรับการค้นหาข้อมูล
  const searchApi = async () => {
    let token = localStorage.getItem("token");
    try {
      const rs = await axios.get(`/publicAPI/searchAttendanceRecords/${search}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if(rs.status === 200){
        setData(rs.data.data)
        setErrMsg(null)
      }
    } catch (err) {
      if(search !== ""){
        setData([])
      }
      setErrMsg(err.response?.data?.message)
    }
  }
  // สิ้นสุดของฟังชั่น

  // ฟังชั่น ส่งออกข้อมูลเป็น Excel
  const exportToExcel = () => {
    // แปลงข้อมูลเป็น array ที่เหมาะสมกับ Excel
    const formattedData = dataSource.map((item) => ({
      "รหัสการบันทึก": item.index,
      "ชื่อผู้ใช้": `${item.users.prefix} ${item.users.fullname_thai}`,
      "ประเภทการทำงาน": item.shift_types.shift_type_name,
      "เวลาเริ่มต้น": item.starting,
      "สถานะการเข้างาน": item.check_in_status.check_in_status_name,
      "เวลาออก": item.ending || "null",
      "สถานะการออกงาน": item.check_out_status?.check_out_status_name || "null",
      "เวลาบันทึก": new Date(item.created_at).toLocaleString("th-TH"),
      "เวลาอัพเดท": new Date(item.updated_at).toLocaleString("th-TH"),
    }));

    // สร้าง worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // สร้าง workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ข้อมูลการเข้าออกงาน");

    // แปลงเป็นไฟล์ Blob
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // ดาวน์โหลดไฟล์
    saveAs(dataBlob, "ข้อมูลการเข้าออกงาน.xlsx");
  };
  // สิ้นสุดของฟังชั่น

  const hdlChengeStartDate = (date) => {
    const [month, day, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    setStartDate(formattedDate)
  }

  const hdlChengeEndDate = (date) => {  
    const [month, day, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    setEndDate(formattedDate)
  }

  const clickSearchDate = async () => {
    let token = localStorage.getItem("token");

    if(!startDate || !endDate) return toast.warning("ไม่พบข้อมูลวันที่ ที่ต้องการค้นหา")

    try {
      const rs = await axios.get(`/publicAPI/searchDateAttendanceRecord/${startDate}/${endDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if(rs.status === 200){
        setData(rs.data.data);
      }
    } catch (err) {
      setData([])
      toast.error(err.response?.data?.message)
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl select-none shadow-md">
      {/* หัวข้อ */}
      <div className="my-2 font-semibold pl-1.5 bg-blue-900 rounded-md shadow-sm">
        <h1 className="bg-blue-50 p-2 pl-3 text-blue-900 flex gap-2 items-center">
          <ChartNoAxesGantt size={20} />
          ข้อมูลลงเวลา เข้า - ออก
          {errMsg && <p className="text-red-600">{errMsg}</p>}
        </h1>
      </div>

      {/* ช่องค้นหาและปุ่ม Export */}
      <div className="flex justify-between items-center px-2 my-4 gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" size={16} strokeWidth={2} />
          <input
            className="rounded-md text-sm px-4 py-2 w-full pl-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => hdlSearchInput(e)}
            type="text"
            placeholder="ค้นหา..."
          />
        </div>
        <Button
          className="px-4 py-2 text-sm font-semibold rounded-md bg-green-800 hover:bg-green-700 transition-all text-white shadow-sm"
          onClick={exportToExcel}
          label={
            <p className="flex gap-1 items-center">
              <Sheet size={15} strokeWidth={2} /> บันทึก Excel <ExternalLink size={10} />
            </p>
          }
        />
      </div>

      {/* ตัวเลือกวันที่ */}
      <div className="my-4 px-2 grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-2/3 lg:w-1/2">
        <div className="flex flex-col">
          <p className="text-sm text-gray-600">วันเริ่มต้น</p>
          <DatePicker
            inputReadOnly
            className="w-full border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(date) => hdlChengeStartDate(new Date(date?.$d).toLocaleDateString())}
            locale={buddhistLocale}
            placeholder="เลือกวันที่..."
          />
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-gray-600">วันสิ้นสุด</p>
          <DatePicker
            inputReadOnly
            disabled={!startDate}
            disabledDate={(current) => 
              startDate ? current.isBefore(startDate, "day") : false
            }
            className="w-full border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            onChange={(date) => hdlChengeEndDate(new Date(date?.$d).toLocaleDateString())}
            locale={buddhistLocale}
            placeholder="เลือกวันที่..."
          />
        </div>
        <div className="flex gap-2 items-end">
          <Button
            onClick={clickSearchDate}
            className="bg-blue-600 w-12 h-10 text-white rounded-md hover:bg-blue-500 transition-all shadow-sm"
            label={<Search className="mx-auto" size={18} />}
          />
          <Button
            onClick={() => fetchApi()}
            className="bg-gray-500 w-12 h-10 text-white rounded-md hover:bg-gray-400 transition-all shadow-sm"
            label={<RefreshCcw className="mx-auto" size={18} />}
          />
        </div>
      </div>

      {/* ตาราง */}
      <Table
        className="overflow-x-auto font-sarabun min-h-fit border-gray-200 rounded-md"
        rowClassName="font-sarabun hover:bg-gray-50"
        dataSource={dataSource}
        locale={{ emptyText: <Empty description={"ไม่พบข้อมูล"} /> }}
        rowKey="index"
        rowHoverable={true}
        columns={columns}
        scroll={{ x: 800 }}
        sortDirections={["ascend", "descend", "ascend"]}
        showSorterTooltip={{ title: "คลิกเพื่อเรียงลำดับ" }}
        size="small"
        pagination={{
          pageSizeOptions: [5, 10, 20, 50, 100],
          showSizeChanger: true,
          defaultPageSize: 10,
          showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        }}
      />
    </div>
  );
}
