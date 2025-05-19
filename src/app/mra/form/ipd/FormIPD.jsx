"use client";

import AGGridWrapper from "@/components/mra/Table/AGGridWrapper";
import axios from "@/configs/axios.mjs";
import MRAThemeHook from "@/hooks/MRAThemeHook.mjs";
import { CircleAlert, CircleCheckBig } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import { toast } from "react-toastify";

export default function FormIPD() {
  const [an, setAn] = useState(null); // เก็บค่า an ที่รับมาจาก input
  const [hospital, setHospital] = useState(null); // เก็บข้อมูลของ โรงพยาบาลที่ดึงมาจาก API
  const [dataAn, setDataAn] = useState({}); // เก็บข้อมูล an ที่ดึงมาจาก API
  const [loadDataTrue, setLoadDataTrue] = useState(false); // เก็บสถานะการค้นหาข้อมูลของตข้อมูลคนไข้ ตัวสถานะ 200
  const [contentData, setContentData] = useState([]); 
  const [unSave, setUnSave] = useState(false); // สถานะแจ้งเดือน่ยังไม่ถูกบันทึก

  const [localPatient, setLocalPatient] = useState({});

  const [loading, setLoading] = useState(false); // เก็บสถานะการโหลดข้อมูล

  const [rowData, setRowData] = useState([]); // เก็บข้อมูลที่ดึงมาจาก API และตัวที่เก็บไว้

  const { themeMRA } = MRAThemeHook(); // เก็บค่า themeMRA ที่ได้จาก MRAThemeHook

  const gridRef = useRef(null); // สร้างตัวเก็บข้อมูลของ AGGrid

  const inputRef = useRef(null); // เก็บตัวเก็บข้อมูลของ input

  useEffect(() => { // โหลดข้อมูลเมื่อโหลดหน้าจอ
    getHCode(); // ดึงข้อมูลโรงพยาบาล
  }, []); // ให้โหลดข้อมูลแค่ครั้งเดียว

  const getHCode = async () => { // ดึงข้อมูลโรงพยาบาล
    try {
      const rs = await axios.get(`/setting/getSettingHcodes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (rs.status === 200) {
        setHospital(rs?.data?.data[0]);
      }
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  const hdlGetPatient = async (anValue) => { // ฟังก์ชันสําหรับการค้นหาข้อมูลคนไข้
    setUnSave(false); // เปลี่ยนสถานะยังไม่ถูกบันทึก
    setLoading(true); // เปลี่ยนสถานะการโหลดข้อมูล
    try {
      const rs = await axios.get(`/private/mraIPD/fetchPatient/${anValue}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // ถ้าค้นหา AN แล้วเจอข้อมูลให้เอาข้อมูลมาแสดง
      if (rs.status === 200) {
        setLoadDataTrue(true); // เปลี่ยนสถานะการโหลดข้อมูล
        setDataAn(rs.data?.data[0]); // เก็บข้อมมูล AN ไว้ใน state
        generateForm(rs.data?.data[0]?.an); // ส่งข้อมูล AN ไปยังฟังก์ชัน generateForm
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message); // แจ้งเตือนเมื่อเกิดข้อผิดพลาด
      if(err.response.status === 409) { // สำหรับข้อผิดพลาด 409
        setUnSave(true) // เปลี่ยนสถานะยังไม่ถูกบันทึก
        const FormData = JSON.parse(localStorage.getItem(`IPD_${an}`)) || contentData; // ดึงข้อมูลจาก localStorage
        setRowData(FormData && FormData[0]?.form_ipd_content_of_medical_record_results); // กําหนดข้อมูลให้กับ rowData
        setLocalPatient(FormData && FormData[0]); // กําหนดข้อมูลให้กับ dataAn
      } else { // ถ้าไม่ใช่ข้อผิดพลาด 409
        setDataAn({}); // เคลียร์ข้อมูล AN
      }
      setLoadDataTrue(false); // เปลี่ยนสถานะการโหลดข้อมูล
      setLoading(false); // เปลี่ยนสถานะการโหลด
    }
  };

  const handleIdle = () => { // ฟังก์ชันสําหรับการหยุดพิมพ์
    if (an?.trim()) {
      hdlGetPatient(an);
    }
  };

  useIdleTimer({
    timeout: 1000, // 1000ms = หยุดพิมพ์
    onIdle: handleIdle, // ใช้ฟังก์ชัน handleIdle
    events: ["keyup"], // ใช้ keyup เท่านั้น
    element: inputRef.current, // ผูกกับ input
    immediateEvents: [], // ไม่ต้องรัน event อื่นทันที
  });

  const generateForm = async (AN) => { // ฟังก์ชันสําหรับการสร้างฟอร์ม
    try {
      const rs = await axios.post("/private/mraIPD", { patient_an: AN }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.setItem(`IPD_${AN}`, JSON.stringify(rs.data.data)); // เก็บข้อมูลใน localStorage
      setContentData(rs.data?.data); // กําหนดข้อมูลให้กับ contentData
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!localPatient) return;

    const dataSecord = {
      fullname: localPatient?.patients?.patient_fullname || "",
      dchdate: localPatient?.patients?.patient_date_discharged?.split("T")[0] || "",
      an,
      regdate: localPatient?.patients?.patient_date_admitted?.split("T")[0] || "",
      hn: localPatient?.patients?.patient_hn || "",
    };

    const isDataEmpty = ["fullname", "dchdate", "regdate", "hn"].every(
      (key) => !dataAn[key]
    );

    if (isDataEmpty && !loadDataTrue) {
      setDataAn(dataSecord);
    }
  }, [localPatient, loadDataTrue]);

  const hdlCellValueChanged = (event) => { // ฟังก์ชันสําหรับการเปลี่ยนแปลงค่าใน AGGrid
    const updatedData = []; // สร้างตัวแปรสําหรับเก็บข้อมูล

    event.api.forEachNode((node) => { // วนลูปใน AGGrid
      updatedData.push(node.data); // เพิ่มข้อมูลใน node.data ไปยัง updatedData
    }); // วนลูป

    const currentFormData = JSON.parse(localStorage.getItem(`IPD_${an}`)) || [{}]; // ดึงข้อมูลจาก localStorage

    currentFormData[0] = { // กําหนดข้อมูลให้กับ currentFormData
      ...currentFormData[0], // คัดลอกข้อมูลเดิม
      form_ipd_content_of_medical_record_results: updatedData, // เปลี่ยนค่าใน form_ipd_content_of_medical_record_results
    }; // กําหนดข้อมูล

    localStorage.setItem(`IPD_${an}`, JSON.stringify(currentFormData)); // เก็บข้อมูลใน localStorage โดยบันทึกทับข้อมูลใน AN เดิมของคนไข้
    event.api.refreshCells({ rowNodes: [event.node], force: true });
  };

  // const isRowLocked = (data) => {
  //   return data?.na || data?.missing || data?.no;
  // };

  const isRowLockedExceptSelf = (data, columnKey) => {
    // Lock เฉพาะถ้า current column ไม่ใช่ na, missing, no
    if (columnKey === 'na') return data?.missing || data?.no;
    if (columnKey === 'missing') return data?.na || data?.no;
    if (columnKey === 'no') return data?.na || data?.missing;
    // ทุกคอลัมน์อื่น ๆ — ถ้าค่าหนึ่งในนั้นติ๊กอยู่ ก็ lock
    return data?.na || data?.missing || data?.no;
  };

  const columnDefs = [ // กําหนดคอลัมน์ใน AGGrid
    {
      headerName: "หัวข้อเวชระเบียน", // ชื่อเวชระเบียน
      field: "content_of_medical_records.content_of_medical_record_name", // ฟิลด์ข้อมูลของหัวข้อเวชระเบียน
      valueGetter: (params) => { // ฟังก์ชันสําหรับการดึงข้อมูล
        const index = params.node.rowIndex + 1; // ดึง index
        const name = params.data.content_of_medical_records // เช็คข้อมูลที่มีชื่อ content_of_medical_records
            ?.content_of_medical_record_name || ""; // ถ้าจริงก็ให้ดึงหัวข้อมา แต่ไม่มีก็ให้เป็น ""
        return `${index}.${name}`; // คืนค่าหัวข้อเวชระเบียน พร้อมกับตัวเลขตำแหน่งหน้าหัวข้อ
      },
    },
    {
      headerName: "NA",
      singleClickEdit: true,
      field: "na",
      width: 60,
      sortable: false,
      resizable: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      cellStyle: (params) => {
        if (isRowLockedExceptSelf(params.data, 'na') || params.data.content_of_medical_records?.na_type === false) {
          return {
            backgroundColor: "#ececec",
            cursor: "not-allowed",
            userSelect: "none",
          };
        }
        return {
        };
      },
      editable: (params) => {
        return !isRowLockedExceptSelf(params.data, 'na') && params.data.content_of_medical_records?.na_type !== false;
      },
    },
    {
      headerName: "Missing",
      field: "missing",
      width: 90,
      headerClass: "text-center",
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      cellStyle: (params) => {
        if (isRowLockedExceptSelf(params.data, 'missing') || params.data.content_of_medical_records?.missing_type === false) {
          return {
            backgroundColor: "#ececec",
            cursor: "not-allowed",
            userSelect: "none",
          };
        }
        return {
        };
      },
      editable: (params) => {
        return !isRowLockedExceptSelf(params.data, 'missing') && params.data.content_of_medical_records?.missing_type !== false;
      },
    },
    {
      headerName: "No",
      field: "no",
      width: 90,
      headerClass: "text-center",
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      cellStyle: (params) => {
        if (isRowLockedExceptSelf(params.data, 'no') || params.data.content_of_medical_records?.no_type === false) {
          return {
            backgroundColor: "#ececec",
            cursor: "not-allowed",
            userSelect: "none",
          };
        }
        return {
        };
      },
      editable: (params) => {
        return !isRowLockedExceptSelf(params.data, 'no') && params.data.content_of_medical_records?.no_type !== false;
      },
    },
    ...Array.from({ length: 9 }, (_, i) => {
      const index = i + 1;
      return {
        cellRenderer: "agCheckboxCellRenderer",
        cellEditor: "agCheckboxCellEditor",
        headerName: `${index}`,
        field: `criterion_number_${index}`,
        width: 60,
        valueParser: (params) => {
          // แปลงค่าที่ถูกลาก/วางเข้ามา
          const value = params.newValue;
          return isNaN(value) ? null : parseInt(value);
        },
        cellStyle: (params) => {
          if (isRowLockedExceptSelf(params.data, `criterion_number_${index}`) || params.data.content_of_medical_records?.[`criterion_number_${index}_type`] === false) {
            return {
              backgroundColor: "#ececec",
              cursor: "not-allowed",
              userSelect: "none",
            };
          }
          return {
          };
        },
        editable: (params) => {
          return !isRowLockedExceptSelf(params.data, `criterion_number_${index}`) && params.data.content_of_medical_records?.[`criterion_number_${index}_type`] !== false;
        },
      };
    }),
    {
      headerName: "หักคะแนน",
      field: "point_deducted",
      width: 100,
      resizable: false,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      cellStyle: (params) => {
        if (isRowLockedExceptSelf(params.data, 'point_deducted') || params.data.content_of_medical_records?.points_deducted_type === false) {
          return {
            backgroundColor: "#ececec",
            cursor: "not-allowed",
            userSelect: "none",
          };
        }
        return {
        };
      },
      editable: (params) => {
        return !isRowLockedExceptSelf(params.data, 'point_deducted') && params.data.content_of_medical_records?.points_deducted_type !== false;
      },
    },
    {
      headerName: "หมายเหตุ",
      field: "comment",
      minWidth: 200,
      headerClass: "text-center",
      editable: true,
    },
  ];

  return (
    <div className="mt-1">
      <div className="flex gap-2 gird grid-cols-2 w-full">
        <div className="w-full">
          <p className="font-semibold py-1 text-sm line-clamp-1">
            รหัสสถานพยาบาล
          </p>
          <input
            className="bg-white border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="text"
            style={{
              borderColor: themeMRA.activeBg,
            }}
            value={hospital?.hcode}
            readOnly
            disabled
          />
        </div>
        <div className="w-full">
          <p className="font-semibold py-1 text-sm line-clamp-1">
            ชื่อสถานพยาบาล
          </p>
          <input
            className="bg-white border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="text"
            style={{
              borderColor: themeMRA.activeBg,
            }}
            value={hospital?.hcode_name}
            readOnly
            disabled
          />
        </div>
      </div>
      <div>
        <p className="font-semibold py-1 text-sm line-clamp-1 mt-1">
          ชื่อ - สกุล
        </p>
        <input
          className="bg-white border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
          type="text"
          style={{
            borderColor: themeMRA.activeBg,
          }}
          value={dataAn?.fullname || ""}
          placeholder="ชื่อ - สกุล"
          readOnly
          disabled
        />
      </div>
      <div className="my-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-2">
        <div>
          <p className="font-semibold py-1 text-sm line-clamp-1">AN</p>
          <input
            className="bg-white border text-gray-900 text-sm rounded-lg focus:ring ring-offset-1 block w-full px-2.5 py-1.5"
            ref={inputRef}
            style={{
              borderColor: themeMRA.activeBg,
              "--tw-ring-color": themeMRA.activeBg,
            }}
            type="text"
            placeholder="AN"
            onChange={(e) => {
              setAn(e.target.value);
              setDataAn({}); // clear ค่าทุกครั้งที่เริ่มพิมพ์
              setLocalPatient({})
              setLoadDataTrue(false);
              setUnSave(false);
              setRowData([]);
            }}
          />
        </div>
        <div>
          <p className="font-semibold py-1 text-sm line-clamp-1">HN</p>
          <input
            className="bg-white border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="text"
            style={{
              borderColor: themeMRA.activeBg,
            }}
            placeholder="HN"
            value={dataAn?.hn || ""}
            readOnly
            disabled
          />
        </div>
        <div>
          <p className="font-semibold py-1 text-sm line-clamp-1">
            วันที่เข้ารับบริการ
          </p>
          <input
            className="bg-white border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="text"
            style={{
              borderColor: themeMRA.activeBg,
            }}
            placeholder="Date admitted"
            value={dataAn?.regdate || ""}
            readOnly
            disabled
          />
        </div>
        <div>
          <p className="font-semibold py-1 text-sm line-clamp-1">
            วันที่สิ้นสุด
          </p>
          <input
            className="bg-white border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="text"
            style={{
              borderColor: themeMRA.activeBg,
            }}
            placeholder="Date discharged"
            value={dataAn?.dchdate || ""}
            readOnly
            disabled
          />
        </div>
        {loadDataTrue && (
          <div className="flex items-end text-green-800 justify-center col-span-2 sm:col-span-1 sm:justify-normal animate-fadeIn pb-1">
            {/* <CircleCheckBig size={30} /> */}
            <p className="px-3 py-1.5 text-xs font-semibold bg-green-200 rounded-full flex items-center gap-0.5">
              <CircleCheckBig size={12} strokeWidth={2.5} /> ค้นหาสำเร็จ
            </p>
          </div>
        )}

        {!loadDataTrue && unSave && (
          <div className="flex items-end text-red-800 justify-center col-span-2 sm:col-span-1 sm:justify-normal animate-fadeIn pb-1">
            {/* <CircleCheckBig size={30} /> */}
            <p className="px-3 py-1.5 text-xs font-semibold bg-red-200 rounded-full flex items-center gap-0.5">
              <CircleAlert size={12} strokeWidth={2.5} /> ยังไม่บันทึกข้อมูล
            </p>
          </div>
        )}
      </div>

      <div>
        <AGGridWrapper
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={() => {
            gridRef.current?.api?.sizeColumnsToFit();
          }}
          pagination={false}
          onCellValueChanged={hdlCellValueChanged}
          height="580px"
          width="100%"
          pinnedRight
          loading={loading}
        />
      </div>
    </div>
  );
}
