"use client";

import { AgGridReact } from "ag-grid-react";
import { useRef, useMemo } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import MRAThemeHook from "@/hooks/MRAThemeHook.mjs";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AGGridWrapper({
  rowData,
  columnDefs,
  quickFilterText = "",
  loading = false,
  onGridReady,
  onCellValueChanged,
  getRowStyle,
  height = "500px",
  pagination = true, 
  width = "100%",
  pinnedRight = true,
}) {
  const { themeMRA } = MRAThemeHook();
  const gridRef = useRef(null);

  const theme = themeQuartz.withParams({
    fontFamily: "Sarabun",
    headerFontFamily: "Sarabun",
    cellFontFamily: "Sarabun",
    headerTextColor: themeMRA?.textHeaderTable,
    headerBackgroundColor: themeMRA?.headerTableBg,
    columnBorder: { color: "#ececec" },
  });

  return (
    <div className="font-sarabun text-sm" style={{ height, width }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        quickFilterText={quickFilterText}
        pagination={pagination}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        loading={loading}
        animateRows={true}
        domLayout="normal"
        defaultColDef={{
          sortable: true,
          resizable: true,
        }}
        singleClickEdit={true}
        rowModelType="clientSide"
        onGridReady={onGridReady}
        getRowStyle={getRowStyle}
        onCellValueChanged={onCellValueChanged}
        theme={theme}
        localeText={{
          page: "หน้า",
          to: "ถึง",
          of: "จาก",
          more: "เพิ่มเติม",
          next: "ถัดไป",
          last: "หน้าสุดท้าย",
          first: "หน้าแรก",
          previous: "ก่อนหน้า",
          loadingOoo: "กำลังโหลด...",
          pageSize: "จำนวนต่อหน้า",
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
  );
}
