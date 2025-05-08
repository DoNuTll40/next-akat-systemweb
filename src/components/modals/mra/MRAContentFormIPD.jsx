"use client";

import { Modal, Form, Input, Select, message } from "antd";
import { useEffect, useState } from "react";
import axios from "@/configs/axios.mjs";
import Ripple from "material-ripple-effects";

export default function AddMedicalRecordModalIPD({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);

  const [toggleState, setToggleState] = useState({});
  const ripple = new Ripple();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("/setting/getPatientServices", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setServices(res.data.data);
    });
  }, []);

  useEffect(() => {
    if (open) {
      setToggleState({});
      form.resetFields();
    }
  }, [open]);

  const handleToggle = (name) => {
    const newValue = !toggleState[name];
    setToggleState((prev) => ({ ...prev, [name]: newValue }));
    form.setFieldValue(name, newValue);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("token");

      const payload = {
        ...values,
        ...toggleState,
      };

      const rs = await axios.post("/setting/insertContentOfMedicalRecord", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (rs.status === 200 || rs.status === 201) {
        message.success("เพิ่มหัวข้อสำเร็จ");
        form.resetFields();
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const optionToggles = [
    { label: "NA", name: "na_type" },
    { label: "Missing", name: "missing_type" },
    { label: "No", name: "no_type" },
    { label: "หักคะแนน", name: "points_deducted_type" },
  ];

  return (
    <Modal
      open={open}
      title="เพิ่มหัวข้อเวชระเบียน"
      onCancel={onClose}
      onOk={handleSubmit}
      okText="บันทึก"
      cancelText="ยกเลิก"
      width={500}
    >
      <Form layout="vertical" form={form} className="select-none">
        <Form.Item
          label="ชื่อหัวข้อเวชระเบียน"
          name="content_of_medical_record_name"
          rules={[{ required: true, message: "กรุณาระบุชื่อหัวข้อ" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="เลือกบริการ"
          name="patient_service_id"
          rules={[{ required: true, message: "กรุณาเลือกบริการ" }]}
        >
          <Select placeholder="เลือกประเภทผู้ป่วย">
            {services.map((s) => (
              <Select.Option key={s.patient_service_id} value={s.patient_service_id}>
                {s.patient_service_name_thai} ({s.patient_service_name_english})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        
        <p className="font-sarabun text-red-500 mb-2">* เลือกหัวข้อที่ต้องการให้กรอกข้อมูล</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-sarabun font-semibold">
          {optionToggles.map((item) => (
            <div
              key={item.name}
              onClick={() => handleToggle(item.name)}
              onMouseUp={(e) => ripple.create(e, 'dark')}
              className={`cursor-pointer px-4 py-2 border rounded text-center transition-all ${
                toggleState[item.name]
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 font-sarabun font-semibold">
          {Array.from({ length: 9 }, (_, i) => {
            const name = `criterion_number_${i + 1}_type`;
            return (
              <div
                key={name}
                onClick={() => handleToggle(name)}
                onMouseUp={(e) => ripple.create(e, 'dark')}
                className={`cursor-pointer px-4 py-2 border rounded text-center transition-all ${
                  toggleState[name]
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                เกณฑ์ {i + 1}
              </div>
            );
          })}
        </div>
      </Form>
    </Modal>
  );
}
