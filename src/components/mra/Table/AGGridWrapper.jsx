"use client";

import { AgGridReact } from "ag-grid-react";
import { useRef, useEffect } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AGGridWrapper({
  rowData,
  columnDefs,
  quickFilterText = "",
  loading = false,
  onGridReady,
  getRowStyle,
  theme,
  height = "500px",
  width = "100%",
  pinnedRight = true,
}) {
  const gridRef = useRef(null);

  return (
    <div className="ag-theme-alpine font-sarabun text-sm" style={{ height, width }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        quickFilterText={quickFilterText}
        pagination={true}
        paginationPageSize={20}
        loading={loading}
        animateRows={true}
        domLayout="normal"
        defaultColDef={{
          sortable: true,
          resizable: true,
        }}
        rowModelType="clientSide"
        onGridReady={onGridReady}
        getRowStyle={getRowStyle}
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
  );
}
