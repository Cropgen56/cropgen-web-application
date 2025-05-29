import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, Row, Col } from "antd";
import "./EventForm.css";

const { Option } = Select;
const { TextArea } = Input;

// Define operation types and progress options as constants for reusability
const OPERATION_TYPES = [
  { value: "tillage", label: "Tillage" },
  { value: "cultivator", label: "Cultivator" },
  { value: "sowing", label: "Sowing" },
  { value: "transplanting", label: "Transplanting" },
  { value: "fertilizer_application", label: "Fertilizer Application" },
  { value: "harvesting", label: "Harvesting" },
  { value: "spray", label: "Spray" },
  {
    value: "interculture_operation",
    label: "Interculture Operation - Weeding, Hand Pick",
  },
  { value: "other", label: "Other" },
];

const PROGRESS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "started", label: "Started" },
];

// Form field configurations for reusability and maintainability
const FORM_FIELDS = [
  {
    name: "supervisorName",
    label: "Supervisor Name",
    span: 12,
    component: <Input />,
    rules: [{ message: "Please enter the supervisor name!" }],
  },
  {
    name: "operationType",
    label: "Operation Type",
    span: 12,
    component: (
      <Select>
        {OPERATION_TYPES.map(({ value, label }) => (
          <Option key={value} value={value}>
            {label}
          </Option>
        ))}
      </Select>
    ),
    rules: [{ message: "Please select the operation type!" }],
  },
  {
    name: "chemicalUsed",
    label: "Chemical Used",
    span: 12,
    component: <Input />,
    rules: [{ message: "Please enter the chemical used!" }],
  },
  {
    name: "progress",
    label: "Progress",
    span: 12,
    component: (
      <Select>
        {PROGRESS_OPTIONS.map(({ value, label }) => (
          <Option key={value} value={value}>
            {label}
          </Option>
        ))}
      </Select>
    ),
    rules: [{ message: "Please select the progress!" }],
  },
  {
    name: "chemicalQuantity",
    label: "Chemical Quantity",
    span: 12,
    component: <Input />,
    rules: [{ message: "Please enter the quantity!" }],
  },
  {
    name: "labourMale",
    label: "Labour (Male)",
    span: 6,
    component: <Input type="number" />,
    rules: [{ message: "Please enter male labour count!" }],
  },
  {
    name: "labourFemale",
    label: "Labour (Female)",
    span: 6,
    component: <Input type="number" />,
    rules: [{ message: "Please enter female labour count!" }],
  },
  {
    name: "estimatedCost",
    label: "Estimated Cost",
    span: 12,
    component: <Input type="number" />,
    rules: [{ message: "Please enter the estimated cost!" }],
  },
  {
    name: "comments",
    label: "Add Comment",
    span: 12,
    component: <TextArea rows={4} />,
  },
];

const EventForm = ({ visible, onClose, onSave, initialData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleSubmit = (values) => {
    onSave(values);
    form.resetFields();
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} centered width={600}>
      <h2 className="add-operation-title">Add Operations</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData}
        style={{ width: "100%" }}
      >
        <Row gutter={16}>
          {FORM_FIELDS.map(({ name, label, span, component, rules }) => (
            <Col span={span} key={name}>
              <Form.Item
                name={name}
                label={label}
                className="add-operation-form-label"
                rules={rules}
              >
                {component}
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Row justify="center">
          <Button
            type="primary"
            htmlType="submit"
            className="add-operation-form-submit-button"
          >
            Add Operations
          </Button>
        </Row>
      </Form>
    </Modal>
  );
};

export default EventForm;
