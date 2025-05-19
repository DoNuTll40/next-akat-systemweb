"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "@/configs/axios.mjs";
import {
  AllCommunityModule,
  ModuleRegistry,
} from "ag-grid-community";
import { convertDateTime } from "@/services/convertDate";
import MRAThemeHook from "@/hooks/MRAThemeHook.mjs";
import AddMedicalRecordModalIPD from "@/components/modals/mra/MRAContentFormIPD";
import { message } from "antd";
import Ripple from "material-ripple-effects";
import AGGridWrapper from "@/components/mra/Table/AGGridWrapper";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TableData() {
  const [resource, setResource] = useState([]);
  const gridRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [routes, setRoutes] = useState([]);
  const { themeMRA } = MRAThemeHook();
  const [rowData, setRowData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editRowId, setEditRowId] = useState(null);

  const ripple = new Ripple();

  const columnDefs = [
    {
      headerName: "No.",
      field: "content_of_medical_record_id",
      width: 70,
      filter: false,
    },
    {
      headerName: "หัวข้อเวชระเบียน",
      field: "content_of_medical_record_name",
      flex: 1,
      minWidth: 200,
      editable: (params) =>
        params.data?.content_of_medical_record_id === editRowId,
    },
    {
      headerName: "ชื่อบริการ (TH)",
      valueGetter: ({ data }) =>
        data.patient_services?.patient_service_name_thai || "-",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "ชื่อบริการ (EN)",
      valueGetter: ({ data }) =>
        data.patient_services?.patient_service_name_english || "-",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "N/A",
      field: "na_type",
      width: 100,
      valueFormatter: ({ value }) => (value ? "✔️" : "❌"),
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      editable: (params) =>
        params.data?.content_of_medical_record_id === editRowId,
    },
    {
      headerName: "Missing",
      field: "missing_type",
      width: 100,
      valueFormatter: ({ value }) => (value ? "✔️" : "❌"),
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      editable: (params) =>
        params.data?.content_of_medical_record_id === editRowId,
    },
    {
      headerName: "No",
      field: "no_type",
      width: 100,
      valueFormatter: ({ value }) => (value ? "✔️" : "❌"),
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      editable: (params) =>
        params.data?.content_of_medical_record_id === editRowId,
    },
    // เกณฑ์ 1-9
    ...Array.from({ length: 9 }, (_, i) => ({
      headerName: `เกณฑ์ ${i + 1}`,
      field: `criterion_number_${i + 1}_type`,
      width: 100,
      editable: (params) => params.data?.content_of_medical_record_id === editRowId,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    })),
    {
      headerName: "หักคะแนน",
      field: "points_deducted_type",
      width: 100,
      valueFormatter: ({ value }) => (value ? "✔️" : "❌"),
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      editable: (params) =>
        params.data?.content_of_medical_record_id === editRowId,
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
    {
      headerName: "การจัดการ",
      field: "actions",
      minWidth: 120,
      maxWidth: 120,
      resizable: false,
      sortable: false,
      pinned: "right",
      lockPosition: "right",
      cellRenderer: ({ data }) => {
        const isEditing = editRowId === data.content_of_medical_record_id;
        console.log(resource);
        return (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => handleSave(data)}
                >
                  บันทึก
                </button>
                <button
                  className="text-gray-500 hover:underline"
                  onClick={() => {
                    getData();
                    setEditRowId(null);
                  }}
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() =>
                    setEditRowId(data.content_of_medical_record_id)
                  }
                >
                  แก้ไข
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(data)}
                >
                  ลบ
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    let token = localStorage.getItem("token");
    setLoading(true);
    try {
      const rs = await axios.get("/setting/getContentOfMedicalRecords", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rs.status === 200) {
        setResource(rs.data.data);
        setRowData(rs.data.data);
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

  const handleSave = async (row) => {
    try {
      const token = localStorage.getItem("token");

      const { content_of_medical_record_id, patient_services, ...output } = row;
      const payload = {
        patient_service_id: patient_services.patient_service_id,
        ...output,
      };

      const res = await axios.put(
        `/setting/updateContentOfMedicalRecord/${row.content_of_medical_record_id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        message.success(res.data.message);
        getData(); // โหลดใหม่
        setEditRowId(null);
      }
    } catch (err) {
      console.log(err);
      message.error(err.response?.data.message);
    }
  };

  const handleDelete = async (row) => {
    if (!row) return;
    const confirm = window.confirm(
      `คุณแน่ใจว่าจะลบ "${row.content_of_medical_record_name}" ใช่หรือไม่?`
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `/setting/removeContentOfMedicalRecord/${row.content_of_medical_record_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 200) {
        message.success("ลบข้อมูลเรียบร้อยแล้ว");
        getData(); // โหลดใหม่
      }
    } catch (err) {
      console.error(err);
      message.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="">
      <AddMedicalRecordModalIPD
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={getData}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">

        <input
          type="text"
          placeholder="ค้นหา..."
          value={searchText}
          onChange={onSearch}
          style={{  
            borderColor: themeMRA.activeBg
          }}
          className="border-1.5 focus:border-gray-500 rounded-lg px-3 py-1.5 w-full sm:w-64 focus:ring-0"
        />

        <button
          onClick={() => setOpenModal(true)}
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

      <AGGridWrapper
        height={"490px"}
        rowData={rowData}
        columnDefs={columnDefs}
        quickFilterText={searchText}
        loading={loading}
        editRowId={editRowId}
        onGridReady={() => {
          gridRef.current?.api?.sizeColumnsToFit();
        }}
        getRowStyle={(params) => {
          if (params.data?.content_of_medical_record_id === editRowId) {
            return {
              backgroundColor: themeMRA.hoverBg,
            };
          }
          return {};
        }}
      />
    </div>
  );
}
