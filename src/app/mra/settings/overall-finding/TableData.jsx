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

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TableData() {
  const [data, setData] = useState([]);
  const gridRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [routes, setRoutes] = useState([]);
  const { themeMRA } = MRAThemeHook();

  useEffect(() => {
    fetch("/hospital/routes.json")
      .then((r) => r.json())
      .then((data) => setRoutes(data.staticRoutes || data.pages || []));
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

  const columnDefs = [
    {
      headerName: "ID",
      field: "overall_finding_id",
      width: 70,
      filter: false,
    },
    {
      headerName: "ชื่อบริการ (TH)",
      field: "overall_finding_name",
      flex: 1,
      minWidth: 160,
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
      const rs = await axios.get("/setting/getOverallFinding", {
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

  const onExport = () => {
    gridRef.current?.api?.exportDataAsCsv({
      fileName: "patient-services.csv",
    });
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="ค้นหา..."
          value={searchText}
          onChange={onSearch}
          className="border rounded px-3 py-2 w-full sm:w-64"
        />
        <button
          onClick={onExport}
          className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2"
        >
          Export CSV
        </button>
      </div>

      <div
        className="ag-theme-alpine font-sarabun text-sm"
        >
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
            filterOoo: 'กรอง...',
            equals: 'เท่ากับ',
            notEqual: 'ไม่เท่ากับ',
            contains: 'มีคำว่า',
            notContains: 'ไม่มีคำว่า',
            startsWith: 'ขึ้นต้นด้วย',
            endsWith: 'ลงท้ายด้วย',
            blank: 'ค่าว่าง',
            notBlank: 'ไม่ว่าง',
            noRowsToShow: 'ไม่พบข้อมูล',
          }}
        />
      </div>

      {/* <ul className="list-disc pl-6">
        {routes.map((r) => (
          <li key={r.route ?? r.page}>
            <code>{r.route ?? r.page}</code>
          </li>
        ))}
      </ul> */}
    </div>
  );
}
