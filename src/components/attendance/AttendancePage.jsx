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
import { render } from "@react-pdf/renderer";
import moment from "moment";
import AttendanceHook from "@/hooks/AttendanceHook";
import { usePathname, useRouter } from "next/navigation";

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

export default function AttendancePage() {
  const {  data, setData, loading, setLoading, fetchApi, token } = AttendanceHook();
  const [search, setSearch] = useState("");
  const { RangePicker } = DatePicker;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errMsg, setErrMsg] = useState(null);
  const [statusExport, setStatusExport] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

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
    startingSignatureUrl: item.starting_signature_id && `https://akathos.moph.go.th/api/public/signatureShowImage/${token}/${item.starting_signature_id}`,
    endingSignatureUrl: item.ending_signature_id && `https://akathos.moph.go.th/api/public/signatureShowImage/${token}/${item.ending_signature_id}`,
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

    // ทำตัวเลือกใน filter จากข้อมูล
  const uniqueCheckShifts = [...new Set(dataSource.map((item) => item?.shifts?.shift_name)),
  ].map((date) => ({
    text: date || 'ไม่มีข้อมูล',
    value: date || 'ไม่มีข้อมูล',
  }));

  const attendanceSummary = {
    checkIn: uniqueCheckInStatus.reduce((acc, status) => {
      acc[status.value] = dataSource.filter(item => 
        (item?.check_in_status?.check_in_status_name || 'ไม่มีข้อมูล') === status.value
      ).length;
      return acc;
    }, {}),
    checkOut: uniqueCheckOutStatus.reduce((acc, status) => {
      acc[status.value] = dataSource.filter(item => 
        (item?.check_out_status?.check_out_status_name || 'ไม่มีข้อมูล') === status.value
      ).length;
      return acc;
    }, {}),
    shiftTypes: uniqueCheckShiftType.reduce((acc, shift) => {
      acc[shift.value] = dataSource.filter(item => 
        (item?.shift_types?.shift_type_name || 'ไม่มีข้อมูล') === shift.value
      ).length;
      return acc;
    }, {})
  };

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
      width: "13rem"
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
      title: "เวร",
      dataIndex: "shifts",
      sorter: (a, b) => a.shifts?.shift_name.localeCompare(b.shifts?.shift_name),
      ellipsis: true,
      render: (_, record) => (
        <div className="w-full h-full flex flex-col gap-1">
          <div className="flex gap-1">
            <p className={`text-xs text-white font-bold bg-amber-500 py-0.5 px-2 rounded w-fit ${!record?.shifts?.shift_name && "hidden"}`}>{record?.shifts?.shift_name}</p>
            <a
              href={`https://www.google.com/maps?q=${record.location_lat_start},${record.location_lon_start}`}
              target="_blank"
              // rel="noopener noreferrer"
              class
              className="text-xs text-white font-bold bg-amber-500 py-0.5 px-2 rounded w-fit"
              hidden={!record?.desc_start}
            >
              สถานที่ลงชื่อ
            </a>
          </div>
          <p className={`text-xs text-white font-bold bg-red-500 py-0.5 px-2 rounded w-fit ${!record?.desc_start && "hidden"}`}>{record?.desc_start && "นอกสถานที่"}</p>
        </div>
      ),
      // filters: uniqueCheckShifts,
      // onFilter: (value, record) => record.shifts?.shift_name === value,
      width: "8rem"
    },
    {
      title: "หมายเหตุเข้างาน",
      dataIndex: "desc_start",
      // sorter: (a, b) => a.desc_start.localeCompare(b.desc_start),
      ellipsis: true,
      width: "11rem"
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
      dataIndex: "startingSignatureUrl",
      render: (startingSignatureUrl) => (
        startingSignatureUrl ? <img className="pointer-events-none" src={startingSignatureUrl} alt="signatureIn" /> : "ไม่มีข้อมูล"
      ),
      width: "7rem"
    },
    {
      title: "ออกงาน",
      dataIndex: "check_out_status",
      // sorter: (a, b) => {
      //   // ตรวจสอบว่ามีข้อมูลหรือไม่ทั้ง a และ b
      //   if (!a.check_out_status?.check_out_status_name || !b.check_out_status?.check_out_status_name) return 0; 
      //   return a.check_out_status.check_out_status_name.localeCompare(b.check_out_status.check_out_status_name);
      // },
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
      dataIndex: "endingSignatureUrl",
      render: (endingSignatureUrl) => (
        endingSignatureUrl ? <img className="pointer-events-none" src={endingSignatureUrl} alt="signatureOut" /> : "ไม่มีข้อมูล"
      ),
      width: "7rem"
    },
        {
      title: "ออกนอกสถานที่",
      dataIndex: "desc_end",
      sorter: (a, b) => a.desc_end?.localeCompare(b.desc_end),
      ellipsis: true,
      render: (_, record) => (
        <div className="w-full h-full flex flex-col gap-1">
          <div className="flex gap-1">
            {/* <p className="text-xs text-white font-bold bg-amber-500 py-0.5 px-2 rounded w-fit">{record?.desc_end || "-"}</p> */}
            <a
              href={`https://www.google.com/maps?q=${record.location_lat_end},${record.location_lon_end}`}
              target="_blank"
              // rel="noopener noreferrer"
              class
              className="text-xs text-white font-bold bg-amber-500 py-0.5 px-2 rounded w-fit"
              hidden={!record?.desc_end}
            >
              สถานที่ลงชื่อ
            </a>
          </div>
          <p className={`text-xs text-white font-bold bg-red-500 py-0.5 px-2 rounded w-fit ${!record?.desc_end && "hidden"}`}>{record?.desc_end && "นอกสถานที่"}</p>
        </div>
      ),
      // filters: uniqueCheckShifts,
      // onFilter: (value, record) => record.shifts?.shift_name === value,
      width: "8rem"
    },
    {
      title: "หมายเหตุเข้างาน",
      dataIndex: "desc_end",
      // sorter: (a, b) => a.desc_end.localeCompare(b.desc_end),
      ellipsis: true,
      width: "11rem"
    },
    // {
    //   title: "วันที่สร้าง",
    //   dataIndex: "created_at",
    //   render: (date) => convertDateTime(date),
    //   sorter: (a, b) => a.created_at.localeCompare(b.created_at),
    //   ellipsis: true,
    //   responsive: ["lg"],
    //   width: "8rem"
    // },
    // {
    //   title: "อัพเดทล่าสุด",
    //   dataIndex: "updated_at",
    //   render: (date) => convertDateTime(date),
    //   sorter: (a, b) => a.updated_at.localeCompare(b.updated_at),
    //   ellipsis: true,
    //   responsive: ["lg"],
    //   width: "8rem"
    // },
  ];
  // สิ้นสุด

  // ฟังชั่นสำหรับการค้นหาข้อมูล
  const searchApi = async () => {
    let token = localStorage.getItem("token");
    try {
      const rs = await axios.get(`/public/searchAttendanceRecords/${search}`, {
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
  
    // กำหนดส่วนหัว
    worksheet.columns = [
      { header: "ลำดับ", key: "index", width: 15 },
      { header: "ชื่อ", key: "user", width: 25 },
      { header: "กะ", key: "shift_type", width: 20 },
      { header: "เวลาเข้า", key: "starting", width: 15 },
      { header: "สถานะเข้า", key: "check_in_status", width: 20 },
      { header: "ลายเซ็นเข้า", key: "starting_signature", width: 20 },
      { header: "เวลาออก", key: "ending", width: 15 },
      { header: "สถานะออก", key: "check_out_status", width: 20 },
      { header: "ลายเซ็นออก", key: "ending_signature", width: 20 },
    ];
  
    // ทำให้ส่วนหัวสวย
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D3D3D3" } };
  
    // วนลูปข้อมูล
    for (const item of dataSource) {
      let startingImageId = null;
      let endingImageId = null;
  
      // ดึงลายเซ็นเข้า
      if (item.startingSignatureUrl) {
        try {
          const response = await fetch(item.startingSignatureUrl);

          if (!response.ok) throw new Error("ดึงลายเซ็นเข้าไม่ได้");
          const blob = await response.blob();

          if (!blob.type.startsWith("image/")) throw new Error("ไม่ใช่รูปภาพ");
          const base64Image = Buffer.from(await blob.arrayBuffer()).toString("base64");
          startingImageId = workbook.addImage({
            base64: `data:image/${blob.type.includes("png") ? "png" : "jpeg"};base64,${base64Image}`,
            extension: blob.type.includes("png") ? "png" : "jpeg",
          });

        } catch (error) {
          console.error(`ปัญหาลายเซ็นเข้า (${item.index}):`, error.message);
        }
      }
  
      // ดึงลายเซ็นออก
      if (item.endingSignatureUrl) {
        try {
          const response = await fetch(item.endingSignatureUrl);

          if (!response.ok) throw new Error("ดึงลายเซ็นออกไม่ได้");
          const blob = await response.blob();

          if (!blob.type.startsWith("image/")) throw new Error("ไม่ใช่รูปภาพ");
          const base64Image = Buffer.from(await blob.arrayBuffer()).toString("base64");
          endingImageId = workbook.addImage({
            base64: `data:image/${blob.type.includes("png") ? "png" : "jpeg"};base64,${base64Image}`,
            extension: blob.type.includes("png") ? "png" : "jpeg",
          });

        } catch (error) {
          console.error(`ปัญหาลายเซ็นออก (${item.index}):`, error.message);
        }
      }
  
      // เพิ่มแถวข้อมูล
      const row = worksheet.addRow({
        index: item.index,
        user: `${item.users.prefixes?.prefix_name} ${item.users.fullname_thai}`,
        shift_type: item.shift_types.shift_type_name,
        starting: item.starting,
        check_in_status: item.check_in_status.check_in_status_name,
        starting_signature: startingImageId !== null ? "" : "ไม่มีลายเซ็น",
        ending: item.ending || "ไม่มีข้อมูล",
        check_out_status: item.check_out_status?.check_out_status_name || "ไม่มีข้อมูล",
        ending_signature: endingImageId !== null ? "" : "ไม่มีลายเซ็น",
      });
  
      // เพิ่มรูปภาพ
      if (startingImageId !== null) {
        worksheet.addImage(startingImageId, {
          tl: { col: 5, row: row.number - 1 },
          ext: { width: 100, height: 50 },
        });
      }

      if (endingImageId !== null) {
        worksheet.addImage(endingImageId, {
          tl: { col: 8, row: row.number - 1 },
          ext: { width: 100, height: 50 },
        });
      }
  
      row.height = 60;
      row.alignment = { vertical: "middle", horizontal: "center" };
    }
  
    // ดาวน์โหลดไฟล์
    const buffer = await workbook.xlsx.writeBuffer();
    const dataBlob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const date = new Date().toLocaleDateString("th-TH").replace(/\//g, "-");
    saveAs(dataBlob, `ข้อมูลการเข้าออกงาน_${date}.xlsx`);
    setStatusExport(false);
  };

  const hdlChengeStartDate = (date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    setStartDate(formattedDate);
  };

  const hdlChengeEndDate = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setEndDate(formattedDate);
  };

  const clickSearchDate = async () => {
    let token = localStorage.getItem("token");

    if(!startDate || !endDate) return toast.warning("ไม่พบข้อมูลวันที่ ที่ต้องการค้นหา")

    try {
      const rs = await axios.get(`/public/searchDateAttendanceRecord/${startDate}/${endDate}`, {
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
            onChange={(date) => date === null ? (setStartDate(null), setEndDate(null)) : hdlChengeStartDate(date.toDate())}
            
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
              !!startDate && current.isBefore(moment(startDate), "day")
            }
            className="w-full border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            onChange={(date) => hdlChengeEndDate(date.toDate())}
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

      {/* scroll board */}
      <div className="my-2 flex justify-between text-sm gap-2">
        <div className="flex gap-2 w-full">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(attendanceSummary?.checkIn || {}).map(([status, count], index) => (
              <p className="border border-blue-900 bg-gradient-to-b from-blue-700 to-blue-900 text-white rounded-full px-4 flex items-center justify-center" key={`checkIn-${index}`}>{`${status} : ${count} คน`}</p>
            ))}
            {Object.entries(attendanceSummary?.checkOut || {}).map(([status, count], index) => (
              <p className="border border-blue-900 bg-gradient-to-b from-blue-700 to-blue-900 text-white rounded-full px-4 flex items-center justify-center" key={`checkOut-${index}`}>{`${status} : ${count} คน`}</p>
            ))}
            {Object.entries(attendanceSummary?.shiftTypes || {}).map(([shift, count], index) => (
              <p className="border border-blue-900 bg-gradient-to-b from-blue-700 to-blue-900 text-white rounded-full px-4 flex items-center justify-center" key={`shift-${index}`}>{`${shift} : ${count} คน`}</p>
            ))}
          </div>
        </div>
        <div className="text-xs text-end font-semibold my-2 w-[35%]">
          <p>ข้อมูล ณ {convertDateTime(sessionStorage.getItem("fetchAttendanceTimeStamp"))}</p>
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
        onRow={(record) => ({
          onClick: () => {
            router.push(`${pathname}/${record.attendance_record_id}`);
          },
          style: { cursor: 'pointer' }
        })}
      />
    </div>
  );
}
