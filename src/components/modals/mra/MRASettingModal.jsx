import { Modal, Form, Input, Button, Checkbox, Select } from "antd";
import { useEffect, useState } from "react";

export default function MRASettingModal({
  open,
  onClose,
  onSuccess,
  initialData = null,
  inputSchema = [],
  addUrl,
  editUrl,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const token = localStorage.getItem("token");

      const isEdit = !!initialData;
      const url = isEdit ? `${editUrl}/${initialData.id}` : addUrl;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      onSuccess(data);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field) => {
    switch (field.type) {
      case "text":
        return <Input />
      case "textarea":
        return <Input.TextArea rows={4} />;
      case "checkbox":
        return <Checkbox>{field.label}</Checkbox>;
      case "select":
        return (
          <Select options={field.options} placeholder={`เลือก${field.label}`} />
        );
      default:
        return <Input />;
    }
  };

  return (
    <Modal
      title={initialData ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {inputSchema.map((field) =>
          field.type === "checkbox" ? (
            <Form.Item
              key={field.name}
              name={field.name}
              valuePropName="checked"
              rules={field.rules || []}
            >
              {renderInput(field)}
            </Form.Item>
          ) : (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.rules || []}
            >
              {renderInput(field)}
            </Form.Item>
          )
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>ยกเลิก</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            {initialData ? "บันทึก" : "เพิ่ม"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
