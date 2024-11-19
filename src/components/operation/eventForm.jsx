import React from "react";
import { Modal, Form, Input, DatePicker, Button } from "antd";
import moment from "moment";

const EventForm = ({ visible, onClose, onSave, initialData }) => {
  const [form] = Form.useForm();

  // Set form values if editing an existing event
  React.useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        title: initialData.title || "",
        start: initialData.start ? moment(initialData.start) : null,
        end: initialData.end ? moment(initialData.end) : null,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values) => {
    onSave(values);
    form.resetFields();
  };

  return (
    <Modal
      title={initialData ? "Edit Event" : "Add Event"}
      visible={visible}
      onCancel={() => onClose()}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter event title!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="start"
          label="Start Time"
          rules={[{ required: true, message: "Please select start time!" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        <Form.Item
          name="end"
          label="End Time"
          rules={[{ required: true, message: "Please select end time!" }]}
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
