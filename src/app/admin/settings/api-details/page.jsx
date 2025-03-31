"use client";

import GenericModal from "@/components/modals/GenericModal";
import axios from "@/configs/axios.mjs";
import { convertDateTime } from "@/services/convertDate";
import { Empty, Popconfirm, Table } from "antd";
import { CirclePlus, ListChecks } from "lucide-react";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" หรือ "edit"
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dataVersion, setDataVersion] = useState([]);
 
  useEffect(() => {
    getSelectVersion();
    fetchApi();
  }, []);

  const fetchApi = async () => {
    setLoading(true);
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.get("/setting/getApiVersionDetails", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (rs.status === 200) {
        setData(rs.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message);
      setData([])
    } finally {
      setLoading(false);
    }
  };

  const getSelectVersion = async () => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.get("/setting/getApiVersions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (rs.status === 200) {
        setDataVersion(rs.data.data);
      }
    } catch (err) {
      toast.error("ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่");
      setDataVersion([])
    } finally {
      setLoading(false);
    }
  }

  // ฟังก์ชันสำหรับสร้างข้อมูลใหม่
  const handleCreate = async (formData) => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.post(
        "/setting/insertApiVersionDetail",
        { 
          api_version_id: latestVersion.api_version_id,
          api_version_detail_comment: formData.api_version_detail_comment
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
      toast.error("ไม่สามารถสร้างข้อมูลได้ กรุณาลองใหม่");
    }
  };

  // ฟังก์ชันสำหรับแก้ไขข้อมูล
  const handleEdit = async (formData) => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.put(
        `/setting/updateApiVersionDetail/${selectedRecord.api_version_detail_id}`,
        { api_version_detail_comment: formData.api_version_detail_comment },
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
      toast.error("ไม่สามารถแก้ไขข้อมูลได้ กรุณาลองใหม่");
    }
  };

  // ฟังก์ชันสำหรับลบข้อมูล
  const handleDelete = async (record) => {
    let token = localStorage.getItem("token");

    try {
      const rs = await axios.delete(
        `/setting/removeApiVersionDetail/${record.api_version_detail_id}`,
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
      toast.error("ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่");
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

  const latestVersion = dataVersion?.reduce((latest, current) => {
    return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
  }, dataVersion[0] || null);

  const dataSource = data.map((item, index) => ({
    ...item,
    index: index + 1,
  }));

  const columns = [
    {
      title: "No.",
      dataIndex: "index",
      sorter: { compare: (a, b) => a.index - b.index },
      width: "5rem",
    },
    {
      title: "เวอร์ชั่น",
      dataIndex: "api_versions", // ชี้ไปที่ object api_versions
      render: (api_versions) => api_versions?.api_version_name || "-", // แสดง api_version_name หรือ "-" ถ้าไม่มีข้อมูล
      sorter: {
        compare: (a, b) =>
          a.api_versions?.api_version_name.localeCompare(b.api_versions?.api_version_name),
      },
      width: "6rem",
    },
    {
      title: "รายละเอียด",
      dataIndex: "api_version_detail_comment",
      sorter: {
        compare: (a, b) =>
          a.api_version_detail_comment.localeCompare(b.api_version_detail_comment),
      },
      width: "15rem",
    },
    {
      title: "สร้างโดย",
      dataIndex: "created_by",
      responsive: ["lg"],
      sorter: (a, b) => a.created_by.localeCompare(b.created_by),
      width: "10rem",
    },
    {
      title: "สร้างเมื่อ",
      dataIndex: "created_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      width: "12rem",
      ellipsis: true,
    },
    {
      title: "อัพเดทโดย",
      dataIndex: "updated_by",
      responsive: ["lg"],
      sorter: (a, b) => a.updated_by.localeCompare(b.updated_by),
      width: "10rem",
    },
    {
      title: "อัพเดทเมื่อ",
      dataIndex: "updated_at",
      render: (date) => convertDateTime(date),
      sorter: (a, b) => a.updated_at.localeCompare(b.updated_at),
      width: "12rem",
      ellipsis: true,
    },
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
    <div className="bg-white p-4 rounded-xl shadow-sm select-none">
      {/* หัวข้อ */}
      <div className="my-2 font-semibold pl-1.5 bg-blue-900 rounded-md shadow-sm">
        <h1 className="bg-blue-50 p-2 pl-3 text-blue-900 flex gap-2 items-center">
          <ListChecks size={20} />
          ข้อมูลรายละเอียด API
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
          { name: "api_version_id", label: "เวอร์ชั่น", type: "text" },
          { name: "api_version_detail_comment", label: "เวอร์ชั่น", type: "textarea" },
        ]}
        initialData={
          modalMode === "edit" && selectedRecord
            ? {
              api_version_id: selectedRecord?.api_versions?.api_version_name,
              api_version_detail_comment: selectedRecord.api_version_detail_comment,
              }
            : { api_version_id: latestVersion?.api_version_name }
        }
        title={modalMode === "create" ? "สร้างสถานะใหม่" : "แก้ไขสถานะ"}
      />

      <Table
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey="index"
        scroll={{ x: 800 }}
        locale={{ emptyText: <Empty description="ไม่พบข้อมูล" /> }}
        sortDirections={["ascend", "descend"]}
        showSorterTooltip={{ title: "คลิกเพื่อเรียงลำดับ" }}
        size="small"
        rowHoverable={false}
        pagination={{
          pageSizeOptions: ["5", "10", "20", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 10,
          showQuickJumper: true,
          showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        }}
      />
    </div>
  );
}
