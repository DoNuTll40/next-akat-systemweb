"use client";

import GenericModal from "@/components/modals/GenericModal";
import axios from "@/configs/axios.mjs";
import { convertDateTime } from "@/services/convertDate";
import { Empty, Popconfirm, Table } from "antd";
import { CirclePlus, ListChecks } from "lucide-react";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function page() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" หรือ "edit"
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.get("/setting/getShifts", {
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

  // ฟังก์ชันสำหรับสร้างข้อมูลใหม่
  const handleCreate = async (formData) => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.post(
        "/setting/insertShift",
        {
          shift_name: formData.shift_name,
          shift_starting: formData.shift_starting, 
          shift_late: formData.shift_late, 
          shift_ending: formData.shift_ending, 
          shift_early: formData.shift_early 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (rs.status === 200 || rs.status === 201) {
        toast.success("สร้างสถานะสำเร็จ!");
        fetchApi();
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  // ฟังก์ชันสำหรับแก้ไขข้อมูล
  const handleEdit = async (formData) => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.put(
        `/setting/updateShift/${selectedRecord.index}`,
        {
          shift_name: formData.shift_name,
          shift_starting: formData.shift_starting, 
          shift_late: formData.shift_late, 
          shift_ending: formData.shift_ending, 
          shift_early: formData.shift_early 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (rs.status === 200) {
        toast.success("แก้ไขสำเร็จ!");
        fetchApi();
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  // ฟังก์ชันสำหรับลบข้อมูล
  const handleDelete = async (record) => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.delete(
        `/setting/removeShift/${record.index}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (rs.status === 200) {
        toast.success("ลบสำเร็จ!");
        fetchApi();
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  // เปิด Modal สำหรับสร้าง
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  // เปิด Modal สำหรับแก้ไข
  const openEditModal = (record) => {
    setModalMode("edit");
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData) => {
    if (modalMode === "create") {
      handleCreate(formData);
    } else if (modalMode === "edit") {
      handleEdit(formData);
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
      width: "5rem",
    },
    {
      title: "ช่วงเวลา",
      dataIndex: "shift_name",
      sorter: (a, b) =>
        a.shift_name.localeCompare(b.shift_name),
      ellipsis: true,
    },
    {
      title: "เวลาเริ่มเข้างาน",
      dataIndex: "shift_starting",
      sorter: (a, b) =>
        a.shift_starting.localeCompare(b.shift_starting),
      ellipsis: true,
    },
    {
      title: "เวลาเข้างานสาย",
      dataIndex: "shift_late",
      sorter: (a, b) =>
        a.shift_late.localeCompare(b.shift_late),
      ellipsis: true,
    },
    {
      title: "เวลาออกงาน",
      dataIndex: "shift_ending",
      sorter: (a, b) =>
        a.shift_ending.localeCompare(b.shift_ending),
      ellipsis: true,
    },
    {
      title: "เวลาออกงานสาย",
      dataIndex: "shift_early",
      sorter: (a, b) =>
        a.เวลาออกงานสาย.localeCompare(b.เวลาออกงานสาย),
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
    ,
    {
      title: "การดำเนินการ",
      render: (record) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(record)}
            className="text-blue-500 hover:cursor-pointer hover:underline"
          >
            แก้ไข
          </button>
          <Popconfirm
            title="คุณต้องการลบข้อมูล"
            description="ยืนยันที่จะลบข้อมูลใช่หรือไม่"
            placement="topLeft"
            onConfirm={ () => handleDelete(record)}
            onCancel={() => console.log("ยกเลิก")}
            okText="ยืนยัน"
            cancelText="ยกเลิก"
          >
            <button className="text-red-500 hover:cursor-pointer hover:underline">
              ลบ
            </button>
          </Popconfirm>
        </div>
      ),
      width: "8rem",
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl text-wrap select-none">
      {/* หัวข้อ */}
      <div className="my-2 font-semibold pl-1.5 bg-blue-900 rounded-md shadow-sm">
        <h1 className="bg-blue-50 p-2 pl-3 text-blue-900 flex gap-2 items-center">
          <ListChecks size={20} />
          ข้อมูลสถานะเวลาวันเข้างาน
        </h1>
      </div>

      <div className="flex justify-end my-3">
        <Button
          className="bg-green-700 hover:bg-green-600 transition py-2 px-6 rounded-md mb-4 text-sm font-semibold text-white shadow-sm"
          onClick={openCreateModal}
          label={
            <div className="flex gap-1.5 items-center">
              <CirclePlus size={16} strokeWidth={3} /> สร้างใหม่
            </div>
          }
        />
      </div>

      <GenericModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        fields={[
          { name: "shift_name", label: "ชื่อสถานะ" },
          { name: "shift_starting", label: "เวลาเริ่มเข้างาน" },
          { name: "shift_late", label: "เวลาเข้างานสาย" },
          { name: "shift_ending", label: "เวลาออกงาน" },
          { name: "shift_early", label: "เวลาออกงานสาย" },
        ]}
        initialData={
          modalMode === "edit" && selectedRecord
            ? {
                shift_name: selectedRecord.shift_name,
                shift_starting: selectedRecord.shift_starting,
                shift_late: selectedRecord.shift_late,
                shift_ending: selectedRecord.shift_ending,
                shift_early: selectedRecord.shift_early,
              }
            : {}
        }
        title={modalMode === "create" ? "สร้างสถานะใหม่" : "แก้ไขสถานะ"}
      />

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="index"
        scroll={{ x: 800 }}
        size="small"
        locale={{ emptyText: <Empty description={"ไม่พบข้อมูล"} /> }}
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
