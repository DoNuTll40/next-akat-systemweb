"use client";

import React, { useEffect, useState } from "react";
import { Empty, Table, Tree } from "antd";
import axios from "@/configs/axios.mjs";
import AuthHook from "@/hooks/AuthHook.mjs";
import { convertDateTime } from "@/services/convertDate";

export default function Page() {
  const { user } = AuthHook();
  const [treeData, setTreeData] = useState([]);
  const [route, setRoute] = useState([]);
  const [source, setSource] = useState([]);

  const names = route
    .filter((r) => r.page !== "/_not-found") // ตัด not-found ออก
    .map((r) => {
      const parts = r.page.split("/").filter(Boolean);
      const name = parts[parts.length - 1] || "home";
      return { ...r, name }; // เพิ่ม key name ลงไปในแต่ละ route
    });

  useEffect(() => {
    fetch("/hospital/routes.json")
      .then((r) => r.json())
      .then((data) => {
        setRoute(data?.staticRoutes);
        const rawRoutes = data.staticRoutes || data.pages || [];
        const filtered = rawRoutes.filter((r) => {
          const path = (r.route ?? r.page)?.toLowerCase();
          return (
            path &&
            path !== "_not-found" &&
            path !== "/_not-found" &&
            path !== "/"
          );
        });

        const root = {};

        // Build nested object tree
        filtered.forEach((r) => {
          const fullPath = r.route ?? r.page;
          const parts = fullPath.split("/").filter(Boolean);
          let current = root;

          parts.forEach((part, i) => {
            const pathKey = parts.slice(0, i + 1).join("/");
            if (!current[part]) {
              current[part] = {
                title: part,
                key: pathKey,
                children: {},
              };
            }
            current = current[part].children;
          });
        });

        // Convert nested object to array format for antd Tree
        const convert = (obj) =>
          Object.values(obj).map((item) => ({
            title: item.title,
            key: item.key,
            children: convert(item.children),
          }));

        setTreeData(convert(root));
      });
  }, []);

  useEffect(() => {
    getAllData();
  }, [])

  const getAllData = async () => {
    let token = localStorage.getItem("token");
    try {
      const rs = await axios.get("/setting/routeFront", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if(rs.status === 200){
        console.log(rs.data)
        setSource(rs.data.data)
      }
    } catch (err) {
      console.log(err)
    }
  }
  
  const hdlSubmit = async () => {
    let token = localStorage.getItem("token");
    try {
      const transferData = names.map((r) => ({
        route_front_name: r.name,
        route_front_path: r.page,
        created_by: user?.fullname_thai,
        updated_by: user?.fullname_thai
      }));

      const output = { data: transferData };

      const rs = await axios.post("/setting/routeFront", output, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const dataSource = source.map((item, index) => ({
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
        width: "5rem",
      },
      {
        title: "route_front_name",
        dataIndex: "route_front_name",
        sorter: (a, b) => a.holiday_name.localeCompare(b.holiday_name),
        ellipsis: true,
      },
      {
        title: "route_front_path",
        dataIndex: "route_front_path",
        sorter: (a, b) => a.holiday_name.localeCompare(b.holiday_name),
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
    <div className="bg-white p-4 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">SiteMap</h1>
      <button onClick={() => hdlSubmit()}>ส่ง</button>
      <Tree treeData={treeData} showLine defaultExpandAll />

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="index"
        locale={{ emptyText: <Empty description={"ไม่พบข้อมูล"} /> }}
        scroll={{ x: 800 }}
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
