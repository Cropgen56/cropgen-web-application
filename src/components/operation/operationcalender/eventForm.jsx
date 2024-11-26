import React from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col } from "antd";
import moment from "moment";

const EventForm = ({ visible, onClose, onSave, initialData }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        title: "",
        cropName: "",
        operationType: "",
        supervisorName: "",
        labourMale: 0,
        labourFemale: 0,
        start: moment(initialData.start),
        end: moment(initialData.end),
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values) => {
    onSave(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Add Operation"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Event Title"
          rules={[{ required: true, message: "Please enter a title!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="cropName"
          label="Crop Name"
          rules={[{ required: true, message: "Please enter the crop name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="operationType"
          label="Operation Type"
          rules={[
            { required: true, message: "Please select the operation type!" },
          ]}
        >
          <Select>
            <Select.Option value="planting">Planting</Select.Option>
            <Select.Option value="harvesting">Harvesting</Select.Option>
            <Select.Option value="irrigation">Irrigation</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="supervisorName"
          label="Supervisor Name"
          rules={[
            { required: true, message: "Please enter the supervisor name!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="labourMale"
          label="Labour (Male)"
          rules={[{ required: true, message: "Enter a valid number!" }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          name="labourFemale"
          label="Labour (Female)"
          rules={[{ required: true, message: "Enter a valid number!" }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          name="start"
          label="Start Date"
          rules={[{ required: true, message: "Please select start date!" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        <Form.Item
          name="end"
          label="End Date"
          rules={[{ required: true, message: "Please select end date!" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventForm;
