"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "@/configs/axios.mjs";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { convertDateTime } from "@/services/convertDate";
import MRAThemeHook from "@/hooks/MRAThemeHook.mjs";
import Ripple from "material-ripple-effects";
import MRASettingModal from "@/components/modals/mra/MRASettingModal";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TableData() {
  const [data, setData] = useState([]);
  const gridRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [routes, setRoutes] = useState([]);
  const { themeMRA } = MRAThemeHook();
  const [editingItem, setEditingItem] = useState(null); // ถ้าเป็น null แปลว่าเพิ่ม
  const [services, setServices] = useState([]);

  const [openModal, setOpenModal] = useState(false);

  const ripple = new Ripple();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("/setting/getPatientServices", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setServices(res.data.data);
    });
  }, []);

  const theme = useMemo(() => {
    return themeQuartz.withParams({
      fontFamily: "Sarabun",
      headerFontFamily: "Sarabun",
      cellFontFamily: "Sarabun",
      headerTextColor: themeMRA?.textHeaderTable,
      headerBackgroundColor: themeMRA?.headerTableBg,
      headerColumnBorder: { color: "white" },
      headerColumnBorderHeight: "80%",
      columnBorder: { color: "#ececec" },
    });
  }, [themeMRA]); // ✅ ตรงนี้สำคัญมาก

  const hdlAdd = () => {
    setEditingItem(null);
    setOpenModal(true);
  };

  const hdlEdit = (item) => {
    setEditingItem(item);
    setOpenModal(true);
  };

  const columnDefs = [
    {
      headerName: "ID",
      field: "review_status_id",
      width: 70,
      filter: false,
    },
    {
      headerName: "ชื่อสถานะการตรวจสอบ",
      field: "review_status_name",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "คำอธิบายสถานะการตรวจสอบ",
      field: "review_status_description",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "สถานะ",
      field: "review_status_type",
      flex: 1,
      minWidth: 160,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    {
      headerName: "ชื่อบริการ (TH)",
      field: "patient_services.patient_service_name_thai",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "ชื่อบริการ (EN)",
      field: "patient_services.patient_service_name_english",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "สร้างโดย",
      field: "created_by",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "วันที่สร้าง",
      field: "created_at",
      flex: 1,
      minWidth: 160,
      filter: false,
      valueFormatter: ({ value }) => convertDateTime(value),
    },
    {
      headerName: "แก้ไขโดย",
      field: "updated_by",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "วันที่แก้ไข",
      field: "updated_at",
      flex: 1,
      minWidth: 160,
      filter: false,
      valueFormatter: ({ value }) => convertDateTime(value),
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    let token = localStorage.getItem("token");
    setLoading(true);
    try {
      const rs = await axios.get("/setting/getReviewStatus", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rs.status === 200) {
        setData(rs.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
  };

  const inputSchema = [
    { name: "title", label: "ชื่อสถานะการตรวจสอบ", type: "text", rules: [{ required: true }] },
    { name: "title", label: "คำอธิบายสถานะการตรวจสอบ", type: "text", rules: [{ required: true }] },
    { name: "active", label: "สถานะ", type: "checkbox" },
    {
      name: "type",
      label: "ประเภท",
      type: "select",
      options: services.map((s) => ({ label: `${s.patient_service_name_english} (${s.patient_service_name_thai})`, value: s.patient_service_id })),
    },
  ];

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="ค้นหา..."
          value={searchText}
          onChange={onSearch}
          style={{
            borderColor: themeMRA.activeBg,
          }}
          className="border-1.5 focus:border-gray-500 rounded-lg px-3 py-1.5 w-full sm:w-64 focus:ring-0"
        />

        <button
          onClick={() => hdlAdd()}
          onMouseUp={(e) => ripple.create(e, "dark")}
          className={`px-6 py-2 text-sm font-semibold rounded-full cursor-pointer`}
          style={{
            backgroundColor: themeMRA.headerBg,
            color: themeMRA.headerText,
          }}
        >
          เพิ่มหัวข้อ
        </button>
      </div>

      <div className="ag-theme-alpine font-sarabun text-sm">
        <AgGridReact
          ref={gridRef}
          rowData={data}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={20}
          domLayout="autoHeight"
          rowModelType="clientSide"
          loading={loading}
          quickFilterText={searchText}
          onGridReady={() => {
            gridRef.current?.api?.sizeColumnsToFit();
          }}
          defaultColDef={{
            filter: true,
            sortable: true,
            resizable: true,
          }}
          theme={theme}
          localeText={{
            filterOoo: "กรอง...",
            equals: "เท่ากับ",
            notEqual: "ไม่เท่ากับ",
            contains: "มีคำว่า",
            notContains: "ไม่มีคำว่า",
            startsWith: "ขึ้นต้นด้วย",
            endsWith: "ลงท้ายด้วย",
            blank: "ค่าว่าง",
            notBlank: "ไม่ว่าง",
            noRowsToShow: "ไม่พบข้อมูล",
          }}
        />
      </div>

      <MRASettingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={(data) => {
          console.log("เพิ่ม/แก้ไขแล้ว:", data);
          fetchData();
        }}
        initialData={editingItem}
        inputSchema={inputSchema}
        addUrl="/setting/addService"
        editUrl="/setting/updateService"
        method="auto" // ไม่จำเป็นต้องระบุ post หรือ put แล้ว
      />
    </div>
  );
}
