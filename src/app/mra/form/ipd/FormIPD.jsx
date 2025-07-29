"use client";

import ConfirmDeleteModal from "@/components/mra/modal/ConfirmDeleteModal";
import MRAFormIPD from "@/components/mra/RenderForm/MRAFormIPD";
import AGGridWrapper from "@/components/mra/Table/AGGridWrapper";
import axios from "@/configs/axios.mjs";
import MRAThemeHook from "@/hooks/MRAThemeHook.mjs";
import { PDFViewer } from "@react-pdf/renderer";
import { Modal } from "antd";
import { CircleAlert, CircleCheckBig } from "lucide-react";
import Ripple from "material-ripple-effects";
import moment from "moment/moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import { toast } from "react-toastify";

export default function FormIPD() {
  const [an, setAn] = useState(""); // เก็บค่า an ที่รับมาจาก input
  const [hospital, setHospital] = useState(""); // เก็บข้อมูลของ โรงพยาบาลที่ดึงมาจาก API
  const [dataAn, setDataAn] = useState({}); // เก็บข้อมูล an ที่ดึงมาจาก API
  const [loadDataTrue, setLoadDataTrue] = useState(false); // เก็บสถานะการค้นหาข้อมูลของตข้อมูลคนไข้ ตัวสถานะ 200
  const [contentData, setContentData] = useState([]); 
  const [reviewStatus, setReviewStatus] = useState([]); // เก็บค่าตัวแปรการรีวิวที่ดึงมาจาก API
  const [unSave, setUnSave] = useState(false); // สถานะแจ้งเดือน่ยังไม่ถูกบันทึก

  const [showModalDelete, setShowModalDelete] = useState(false);

  const [pdfReady, setPdfReady] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const pdfRef = useRef();

  const [localPatient, setLocalPatient] = useState({});

  const [selectedReviewStatus, setSelectedReviewStatus] = useState(null);

  const selectedItem = reviewStatus.find((item) => item.review_status_id === selectedReviewStatus);

  const [selectOverallFinding, setSelectOverallFinding] = useState([]);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false); // เก็บสถานะการโหลดข้อมูล

  const [rowData, setRowData] = useState([]); // เก็บข้อมูลที่ดึงมาจาก API และตัวที่เก็บไว้

  const { themeMRA } = MRAThemeHook(); // เก็บค่า themeMRA ที่ได้จาก MRAThemeHook

  const gridRef = useRef(null); // สร้างตัวเก็บข้อมูลของ AGGrid

  const inputRef = useRef(null); // เก็บตัวเก็บข้อมูลของ input

  const ripple = new Ripple();

  const [output, setOutput] = useState([]);

  useEffect(() => { // โหลดข้อมูลเมื่อโหลดหน้าจอ
    getReviewStatus();
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

  const getReviewStatus = async () => { // ดึงข้อมูลการรีวิว
    try {
      const rs = await axios.get(`/setting/getReviewStatus`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (rs.status === 200) {
        setReviewStatus(rs?.data?.data);
      }
    } catch (err) {
      console.log(err.response.data.message);
    }
  }

  const hdlGetPatient = async (anValue) => { // ฟังก์ชันสําหรับการค้นหาข้อมูลคนไข้

    const toastId = toast.loading("ระบบกำลังโหลดข้อมูล...", {
      closeOnClick: true,
      autoClose: 2000,
    });

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

        toast.update(toastId, {
          render: "โหลดข้อมูลสําเร็จ",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

      }
    } catch (err) {
      if(err.response.status === 409) { // สำหรับข้อผิดพลาด 409

        generateForm(anValue);
        setUnSave(true) // เปลี่ยนสถานะยังไม่ถูกบันทึก
        toast.dismiss(toastId); // ปิด toast แบบไม่แสดง error
        return;

      } else { // ถ้าไม่ใช่ข้อผิดพลาด 409
        setDataAn({}); // เคลียร์ข้อมูล AN

        toast.update(toastId, {
          render: err.response?.data?.message || err.message,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });

        return;
      }
      setLoadDataTrue(false); // เปลี่ยนสถานะการโหลดข้อมูล
    } finally {
      setLoading(false);
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

    const toastId = toast.loading("ระบบกำลังโหลดข้อมูลของฟอร์ม...", {
      closeOnClick: true,
    });

    try {
      const rs = await axios.post("/private/mraIPD", { patient_an: AN }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.setItem(`IPD_${AN}`, JSON.stringify(rs.data.data)); // เก็บข้อมูลใน localStorage
      setContentData(rs.data?.data);
      const FormData = rs.data?.data; // กําหนดข้อมูลให้กับ FormData
      setRowData(FormData && FormData[0]?.form_ipd_content_of_medical_record_results); // กําหนดข้อมูลให้กับ rowData
      setLocalPatient(FormData && FormData[0]); // กําหนดข้อมูลให้กับ dataAn
      getReviewStatus();
      const results = FormData && FormData[0]?.form_ipd_overall_finding_results;

      if (Array.isArray(results)) {
        const selected = results
          .filter(item => item.overall_finding_result)
          .map(item => item.overall_finding);

        setSelectOverallFinding(selected);
      }

      toast.update(toastId, {
        render: "สร้างฟอร์มสําเร็จ",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      toast.dismiss(toastId);
      console.log(err);
      if(err.response.status === 409) { // สำหรับข้อผิดพลาด 409
        hdlPreviewSubmit(); // ส่งข้อมูลไปยังฟังก์ชัน hdlPreviewSubmit
        setDataAn({})
        setLoadDataTrue(false)
        setContentData([])
        setReviewStatus([])
        setUnSave(false)
        setLocalPatient({}) 
        setSelectOverallFinding([])
        setSelectedReviewStatus(null)
        setRowData([])
        setOutput({})
        setPdfReady(false);
        setPdfData(null);
      }
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

    setOutput({
      ...output,
      content: updatedData.map((item) => {
        const {
          created_at,
          updated_at,
          created_by,
          updated_by,
          total_score,
          content_of_medical_records,
          // form_ipd_content_of_medical_record_result_id,
          ...rest
        } = item;

        const content_of_medical_record_id = content_of_medical_records?.content_of_medical_record_id;

        const converted = {
          content_of_medical_record_id,
        };

        for (const key in rest) {
          const value = rest[key];
          if (key === "comment") {
            converted[key] = value ?? null;
          } else if (key === "na" || key === "missing" || key === "no") {
            // na, missing, no คง true/false ตามเดิม
            converted[key] = !!value;
          } else {
            converted[key] =
                typeof value === "boolean" ? (value ? 1 : 0)
                : value == null ? 0  // สำหรับ null หรือ undefined
              : value;
          }
        }

        return converted;
      }),
    });

    localStorage.setItem(`IPD_${an}`, JSON.stringify(currentFormData)); // เก็บข้อมูลใน localStorage โดยบันทึกทับข้อมูลใน AN เดิมของคนไข้
    event.api.refreshCells({ rowNodes: [event.node], force: true });
  };

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
      const field = `criterion_number_${index}`;
      return {
        cellRenderer: "agCheckboxCellRenderer",
        cellEditor: "agCheckboxCellEditor",
        headerName: `${index}`,
        field,
        width: 60,

        // ✅ แปลงค่า 0/1 เป็น true/false
        valueGetter: (params) => {
          const value = params.data?.[field];
          return value === 1 ? true : false;
        },

        // ✅ เมื่อแก้ไขค่าแล้วส่งกลับมาเป็น 0/1
        valueSetter: (params) => {
          params.data[field] = params.newValue ? 1 : 0;
          return true; // ต้อง return true เพื่อให้ grid รู้ว่าค่าเปลี่ยนแล้ว
        },

        cellStyle: (params) => {
          if (
            isRowLockedExceptSelf(params.data, field) ||
            params.data.content_of_medical_records?.[`${field}_type`] === false
          ) {
            return {
              backgroundColor: "#ececec",
              cursor: "not-allowed",
              userSelect: "none",
            };
          }
          return {};
        },

        editable: (params) => {
          return (
            !isRowLockedExceptSelf(params.data, field) &&
            params.data.content_of_medical_records?.[`${field}_type`] !== false
          );
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

      // ✅ แปลง 0/1 → true/false เพื่อให้ checkbox ติกถูกต้อง
      valueGetter: (params) => {
        const value = params.data?.point_deducted;
        return value === 1 ? true : false;
      },

      // ✅ แปลง true/false → 1/0 เมื่อ user แก้ไข
      valueSetter: (params) => {
        params.data.point_deducted = params.newValue ? 1 : 0;
        return true; // ต้อง return true เพื่อให้ ag-grid อัปเดต
      },

      cellStyle: (params) => {
        if (
          isRowLockedExceptSelf(params.data, 'point_deducted') ||
          params.data.content_of_medical_records?.points_deducted_type === false
        ) {
          return {
            backgroundColor: "#ececec",
            cursor: "not-allowed",
            userSelect: "none",
          };
        }
        return {};
      },

      editable: (params) => {
        return (
          !isRowLockedExceptSelf(params.data, 'point_deducted') &&
          params.data.content_of_medical_records?.points_deducted_type !== false
        );
      },
    },
    {
      headerName: "หมายเหตุ",
      field: "comment",
      minWidth: 300,
      headerClass: "text-center",
      editable: true,
    },
  ];

  const hdlToggleOverallFinding = (item, form_ipd_overall_finding_result_id) => {
  setSelectOverallFinding(prev => {
    const isSelected = prev.some(f => f.overall_finding_id === item.overall_finding.overall_finding_id);

    const newSelection = isSelected
      ? prev.filter(f => f.overall_finding_id !== item.overall_finding.overall_finding_id)
      : [...prev, item.overall_finding]; // ✅ เก็บเฉพาะ overall_finding

    const overallOutput = newSelection.map(finding => ({
      // ❗ หาค่า form_ipd_overall_finding_result_id โดยดูจาก original item
      form_ipd_overall_finding_result_id: (
        contentData?.form_ipd_overall_finding_results ??
        localPatient?.form_ipd_overall_finding_results ??
        []
      ).find(x => x.overall_finding.overall_finding_id === finding.overall_finding_id)?.form_ipd_overall_finding_result_id ?? null,

      overall_finding_id: finding.overall_finding_id,
      overall_finding_result: true
    }));

    setOutput(prev => ({ ...prev, overall: overallOutput }));

    return newSelection;
  });
};

  const hdlToggleReviewStatus = (item) => {
    item?.review_status_id !== 3 && setComment('');
    setOutput((prev) => ({
      ...prev,
      review_status_id: item.review_status_id,
      review_status_result: true,
    }))
  }

  useEffect(() => {
    selectedItem?.review_status_id === 3 && setOutput((prev) => ({
      ...prev,
      review_status_comment: comment
    }));
  }, [comment, selectedItem]);

  const hdlPreSubmit = async () => {

    const toastId = toast.loading("ระบบกําลังบันทึกข้อมูล...");

    try {
      if(!output?.content) return toast.error("ไม่สามารถบันทึกได้ เนื่องจากไม่พบการเปลี่ยนแปลงในตาราง IPD");

      const rs = await axios.put(`/private/mraIPD/${an}`, output, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
      }})

      if(rs.status === 200){
        toast.update(toastId, {
          render: rs.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setDataAn({})
        setLoadDataTrue(false)
        setContentData([])
        setReviewStatus([])
        setUnSave(false)
        setLocalPatient({}) 
        setSelectOverallFinding([])
        setSelectedReviewStatus(null)
        setRowData([])
        setOutput({})
        setPdfReady(false);
        setPdfData(null);
        if(output?.review_status_id){
          localStorage.removeItem(`IPD_${an}`);
          hdlPreviewSubmit();
        } else {
          setAn("");
        }
      }

    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render:err.response.data.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  }

  const hdlResetState = async () => {
    setAn("")
    setDataAn({})
    setLoadDataTrue(false)
    setContentData([])
    setReviewStatus([])
    setUnSave(false)
    setLocalPatient({}) 
    setSelectOverallFinding([])
    setSelectedReviewStatus(null)
    setRowData([])
    setOutput({})
    setPdfReady(false);
    setPdfData(null);
  }

  console.log(dataAn)

  const hdlPreviewSubmit = async () => {

    const toastId = toast.loading("ระบบกำลังสร้างหน้า PDF ให้ กรุณารอสักครู่...");

    try {
      // 1. ดึงข้อมูล API (หรือใช้ข้อมูลที่มีใน state)
      const rs = await axios.get(`/private/mraIPD/${an}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }) // หรือรับจาก props

      const data = rs.data.data[0];
      if(rs.status === 200){
        toast.update(toastId, {
          render: "สร้างหน้า PDF สําเร็จ",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setPdfReady(true);
        setPdfData(data);
        setDataAn({
          fullname: data.patients.patient_fullname,
          an: data.patients.patient_an,
          hn: data.patients.patient_hn,
          vstdate: moment(data.patients.patient_date_service).format("YYYY-MM-DD"),
          regdate: moment(data.patients.patient_date_admitted).format("YYYY-MM-DD"),
          dchdate: moment(data.patients.patient_date_discharged).format("YYYY-MM-DD"),
        })

        setLoadDataTrue(true);

        setTimeout(() => {
          if (pdfRef.current) {
            pdfRef.current.focus();
          }
        }, 500);
      }
    } catch (err) {
      console.log(err);
      toast.dismiss(toastId);
    }
  }

  const hdlShowDelete = () => {
    setShowModalDelete(true);
  }

  const memoizedPdf = useMemo(() => {
    return <PDFViewer ref={pdfRef} key={an} width="100%" height="100%"><MRAFormIPD {...pdfData} /></PDFViewer>;
  }, [pdfData]);

  const onDeleteFormIPD = async ({ an, password }) => {

    const toastId = toast.loading("ระบบกําลังลบข้อมูล...");

    try {
      const rs = await axios.delete(`/private/mraIPD/${an}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: { password },
      });

      if (rs.status === 200) {
        toast.update(toastId,  { 
          render: rs.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        hdlResetState();
        return true; // ✅ สำเร็จ
      }
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "ลบไม่สำเร็จ",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      console.error(err);
      return false; // ❌ ไม่สำเร็จ
    }
  };

  return (
    <>
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
              borderColor: themeMRA?.activeBg,
            }}
            value={hospital?.hcode || ""}
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
              borderColor: themeMRA?.activeBg,
            }}
            value={hospital?.hcode_name || ""}
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
            borderColor: themeMRA?.activeBg,
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
              borderColor: themeMRA?.activeBg,
              "--tw-ring-color": themeMRA?.activeBg,
            }}
            type="text"
            placeholder="AN"
            value={an || ""}
            onChange={(e) => {
              setAn(e.target.value);
              setDataAn({}); // clear ค่าทุกครั้งที่เริ่มพิมพ์
              setLocalPatient({})
              setLoadDataTrue(false);
              setUnSave(false);
              setRowData([]);
              setPdfReady(false);
            }}
          />
        </div>
        <div>
          <p className="font-semibold py-1 text-sm line-clamp-1">HN</p>
          <input
            className="bg-white border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="text"
            style={{
              borderColor: themeMRA?.activeBg,
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
              borderColor: themeMRA?.activeBg,
            }}
            placeholder="Date admitted"
            value={dataAn?.regdate ? moment(dataAn?.regdate).add(543, "year").locale("th").format("DD/MM/YYYY") : ""}
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
              borderColor: themeMRA?.activeBg,
            }}
            placeholder="Date discharged"
            value={dataAn?.dchdate ? moment(dataAn?.dchdate).add(543, "year").locale("th").format("DD/MM/YYYY") : ""}
            readOnly
            disabled
          />
        </div>
        {loadDataTrue && (
          <div className="flex w-full items-end gap-4 text-green-800 justify-between col-span-2 sm:col-span-1 sm:justify-normal animate-fadeIn pb-1">
            {/* <CircleCheckBig size={30} /> */}
            <p className="px-3 py-1.5 text-xs font-semibold bg-green-200 rounded-full flex items-center gap-0.5 line-clamp-1 text-nowrap">
              <CircleCheckBig size={12} strokeWidth={2.5} /> ค้นหาสำเร็จ
            </p>

            {pdfReady && (
              <button className="border px-6 rounded-full bg-red-200 border-red-600 text-red-600 hover:cursor-pointer focus:outline-0" onClick={hdlShowDelete} onMouseUp={(e) => ripple.create(e, "light")}>ลบ</button>
            )}
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

      {!pdfReady && (
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
      )}

      {rowData?.length !== 0 && (
        <div className="mt-4 text-sm ml-6">
          <p className="underline font-medium my-2 text-[15px]">ประเมินคุณภาพการบันทึกเวชระเบียนในภาพรวม</p>
          <div className="flex gap-1 flex-col md:flex-row">
            <p className="font-medium w-[130px]">Overall finding</p>
            <div className="flex flex-col gap-2">
              {(contentData?.form_ipd_overall_finding_results ?? localPatient?.form_ipd_overall_finding_results)?.map((item, index) => (
                <label className="flex items-center gap-2 animate-fadeIn" key={`overall-${index}`} htmlFor={`overall-finding-${index}`}>
                  <input 
                    className="rounded-full" 
                    type="checkbox" 
                    id={`overall_finding_${item?.overall_finding?.overall_finding_id}`} 
                    style={{
                      backgroundColor: selectOverallFinding.some(f => f.overall_finding_id === item?.overall_finding?.overall_finding_id) ? themeMRA?.activeBg : "transparent",
                      borderColor: themeMRA?.activeBg,
                      "--tw-ring-color": themeMRA?.activeBg,
                    }}
                    onChange={() => hdlToggleOverallFinding(item, item.form_ipd_overall_finding_result_id)}
                    defaultChecked={selectOverallFinding.some(f => f.overall_finding_id === item?.overall_finding?.overall_finding_id) || item?.overall_finding_result}
                  />
                  {item?.overall_finding?.overall_finding_name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-1 mt-2 flex-col md:flex-row">
              <p className="font-medium w-[130px]">(เลือกเพียง 1 ข้อ)</p>
              <div className="flex flex-col gap-2">
                {reviewStatus.map((item, index) => (
                  <label className="flex items-center gap-2 animate-fadeIn" key={`review-${index}`} htmlFor={`review-status-${index}`}>
                    <input 
                      className="rounded-full" 
                      type="radio" 
                      name="review-status" 
                      onChange={() => { setSelectedReviewStatus(item?.review_status_id), hdlToggleReviewStatus(item) }}
                      style={{
                        backgroundColor: selectedItem?.review_status_id === item?.review_status_id ? themeMRA?.activeBg : "transparent",
                        borderColor: themeMRA?.activeBg,
                        "--tw-ring-color": themeMRA?.activeBg,
                      }}
                    />
                    {item?.review_status_name} ({item?.review_status_description})
                  </label>
                ))}
                
                {/* แสดง input ถ้า review_status_type เป็น true */}
                  {selectedItem?.review_status_type === true && (
                    <input
                      className="bg-white border text-gray-900 text-sm rounded-lg focus:ring ring-offset-1 block w-full px-2.5 py-1.5"
                      type="text"
                      style={{
                        borderColor: themeMRA?.activeBg,
                        "--tw-ring-color": themeMRA?.activeBg,
                      }}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="โปรดระบุความคิดเห็น"
                    />
                  )}
              </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button 
              className="border px-10 py-1.5 rounded-full font-semibold hover:cursor-pointer" 
              type="button"
              onMouseUp={ (e) => ripple.create(e, "light") }
              onClick={hdlPreSubmit}
              style={{
                backgroundColor: themeMRA.headerTableBg,
                color: themeMRA.textHeaderTable
              }}
              >{output?.review_status_id ? "บันทึก" : "บันทึกฉบับร่าง"}</button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        showModalDelete={showModalDelete}
        setShowModalDelete={setShowModalDelete}
        data={pdfData}
        onConfirmDelete={async ({ password, originalAn }) => {
          return await onDeleteFormIPD({ an: originalAn, password });
        }}
      />

      {pdfReady && (
        <div className="w-full h-dvh overflow-hidden rounded-md">
          {pdfData && memoizedPdf}
        </div>      
      )}

    </div>
  
    </>
  );
}
