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
import ExcelJS from "exceljs";
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
  const [errMsg, setErrMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [statusExport, setStatusExport] = useState(false);

  useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    let token = localStorage.getItem("token");
    setToken(token)
    try {
      setData([])
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
    } finally {
      setLoading(false)
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
      render: (users) => (users ? `${users.prefixes?.prefix_name} ${users.fullname_thai}` : "-"),
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
      title: "ลงชื่อเข้า",
      dataIndex: "starting_signature_id",
      render: (starting_signature_id) => (
        <img className="pointer-events-none" src={`https://akathos.moph.go.th/akatApi/publicAPI/signatureShowImage/${token}/${starting_signature_id}`} alt="" />
      ),
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
      width: "8rem"
    },
    {
      title: "ลงชื่อออก",
      dataIndex: "ending_signature_id",
      render: (ending_signature_id) => (
        <img className="pointer-events-none" src={`https://akathos.moph.go.th/akatApi/publicAPI/signatureShowImage/${token}/${ending_signature_id}`} alt="" />
      ),
      width: "7rem"
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "created_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      ellipsis: true,
      responsive: ["lg"],
    },
    {
      title: "อัพเดทล่าสุด",
      dataIndex: "updated_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.updated_at.localeCompare(b.updated_at),
      ellipsis: true,
      responsive: ["lg"],
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
  
  const exportToExcel = async () => {
    setStatusExport(true);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ข้อมูลการเข้าออกงาน");
  
    worksheet.columns = [
      { header: "รหัสการบันทึก", key: "index", width: 15 },
      { header: "ชื่อผู้ใช้", key: "user", width: 25 },
      { header: "ประเภทการทำงาน", key: "shift_type", width: 20 },
      { header: "เวลาเริ่มต้น", key: "starting", width: 15 },
      { header: "สถานะการเข้างาน", key: "check_in_status", width: 20 },
      { header: "ลงชื่อเข้า", key: "starting_signature", width: 20 },
      { header: "เวลาออก", key: "ending", width: 15 },
      { header: "สถานะการออกงาน", key: "check_out_status", width: 20 },
      { header: "ลงชื่อออก", key: "ending_signature", width: 20 },
    ];
  
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D3D3D3" },
    };
  
    for (let i = 0; i < dataSource.length; i++) {
      const item = dataSource[i];
    
      if (i === 0) {
        console.log("📌 แถวแรก:", item);
        console.log("📌 starting_signature_id:", item.starting_signature_id);
        console.log("📌 URL:", `https://akathos.moph.go.th/akatApi/publicAPI/signatureShowImage/${token}/${item.starting_signature_id}`);
      }
    
      const startingSignatureUrl = `https://akathos.moph.go.th/akatApi/publicAPI/signatureShowImage/${token}/${item.starting_signature_id}`;
      const endingSignatureUrl = `https://akathos.moph.go.th/akatApi/publicAPI/signatureShowImage/${token}/${item.ending_signature_id}`;
    
      let startingImageId = null;
      let endingImageId = null;
  
      // ดึงรูปภาพลายเซ็นเข้า
      if (item.starting_signature_id) {
        try {
          const response = await fetch(startingSignatureUrl);
          console.log(`Starting Signature Response Status: ${response.status}`);
          if (!response.ok) {
            throw new Error(`ไม่สามารถดึงรูปภาพลายเซ็นเข้าได้: ${response.statusText}`);
          }
          const blob = await response.blob();
          console.log(`Starting Signature Blob Type: ${blob.type}`); // ตรวจสอบประเภทไฟล์
          const arrayBuffer = await blob.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString("base64");
  
          // กำหนด extension ตามประเภทไฟล์
          const extension = blob.type.includes("png") ? "png" : "jpeg";
          startingImageId = workbook.addImage({
            base64: `data:image/${extension};base64,${base64Image}`,
            extension: extension,
          });
        } catch (error) {
          console.error("Error fetching starting signature:", error.message);
        }
      }
  
      // Debug: ตรวจสอบ ending_signature_id
      console.log(`Ending Signature ID: ${item.ending_signature_id}`);
      console.log(`Ending Signature URL: ${endingSignatureUrl}`);
  
      // ดึงรูปภาพลายเซ็นออก
      if (item.ending_signature_id) {
        try {
          const response = await fetch(endingSignatureUrl);
          console.log(`Ending Signature Response Status: ${response.status}`);
          if (!response.ok) {
            throw new Error(`ไม่สามารถดึงรูปภาพลายเซ็นออกได้: ${response.statusText}`);
          }
          const blob = await response.blob();
          console.log(`Ending Signature Blob Type: ${blob.type}`);
          const arrayBuffer = await blob.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString("base64");
  
          const extension = blob.type.includes("png") ? "png" : "jpeg";
          endingImageId = workbook.addImage({
            base64: `data:image/${extension};base64,${base64Image}`,
            extension: extension,
          });
        } catch (error) {
          console.error("Error fetching ending signature:", error.message);
        }
      }
  
      const row = worksheet.addRow({
        index: item.index,
        user: `${item.users.prefixes?.prefix_name} ${item.users.fullname_thai}`,
        shift_type: item.shift_types.shift_type_name,
        starting: item.starting,
        check_in_status: item.check_in_status.check_in_status_name,
        starting_signature: startingImageId ? "" : "ไม่มีลายเซ็น",
        ending: item.ending || "ไม่มีข้อมูล",
        check_out_status: item.check_out_status?.check_out_status_name || "ไม่มีข้อมูล",
        ending_signature: endingImageId ? "" : "ไม่มีลายเซ็น",
      });
  
      if (startingImageId) {
        worksheet.addImage(startingImageId, {
          tl: { col: 5, row: row.number - 1 },
          ext: { width: 100, height: 50 },
        });
      }
  
      if (endingImageId) {
        worksheet.addImage(endingImageId, {
          tl: { col: 8, row: row.number - 1 },
          ext: { width: 100, height: 50 },
        });
      }
  
      row.height = 60;
      row.alignment = { vertical: "middle", horizontal: "center" };
    }
  
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowNumber % 2 === 0 ? "F5F5F5" : "FFFFFF" },
        };
      }
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const dataBlob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const date = new Date().toLocaleDateString("th-TH").replace(/\//g, "-");
    saveAs(dataBlob, `ข้อมูลการเข้าออกงาน_${date}.xlsx`);
    setStatusExport(false);
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
          className="px-4 py-2 text-sm font-semibold disabled:opacity-50 rounded-md bg-green-800 hover:bg-green-700 transition-all text-white shadow-sm"
          onClick={exportToExcel}
          disabled={!dataSource || statusExport}
          label={
            <p className="flex gap-1 items-center">
              {statusExport ? <>กำลังบันทึก...</> : <><Sheet size={15} strokeWidth={2} /> บันทึก Excel <ExternalLink size={10} /></>}
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
        loading={loading}
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
