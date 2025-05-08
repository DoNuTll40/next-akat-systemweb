"use client";

import axios from "@/configs/axios.mjs";
import { convertDateTime } from "@/services/convertDate";
import { Empty, Table } from "antd";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

export default function page() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.get("/setting/getCheckOutStatus", {
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

  const dataSource = data.map((item, index) => ({
    ...item,
    index: index + 1,
  }));

  const columns = [
    {
      title: "ID",
      dataIndex: "index",
      sorter: (a, b) => a.index - b.index,
      responsive: ["md"],
      ellipsis: true,
      width: "5rem"
    },
    {
      title: "ชื่อสถานะ",
      dataIndex: "check_out_status_name",
      sorter: (a, b) => a.check_out_status_name.localeCompare(b.check_out_status_name),
      ellipsis: true,
    },
    {
      title: "สร้างโดย",
      dataIndex: "created_by",
      responsive: ["lg"],
      sorter: (a, b) => a.created_by.localeCompare(b.created_by),
      ellipsis: true,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "created_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      ellipsis: true,
    },
    {
      title: "อัพเดทโดย",
      dataIndex: "updated_by",
      responsive: ["lg"],
      sorter: (a, b) => a.updated_by.localeCompare(b.updated_by),
      ellipsis: true,
    },
    {
      title: "วันที่อัพเดท",
      dataIndex: "updated_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.updated_at.localeCompare(b.updated_at),
      ellipsis: true,
    },
  ];
  
  return (
    <div className="bg-white p-4 rounded-xl select-none">
      <Table
        className="overflow-x-auto font-sarabun"
        rowClassName="font-sarabun"
        dataSource={dataSource}
        columns={columns}
        rowKey="index"
        scroll={{ x: 800 }}
        locale={{ emptyText: <Empty description={"ไม่พบข้อมูล"} /> }}
        size="small"
        pagination={{
          pageSizeOptions: ["5", "10", "20", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 10,
          showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        }}
      />
    </div>
  );
}
