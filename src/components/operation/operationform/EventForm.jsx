import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, Row, Col, message } from "antd";
import { useDispatch } from "react-redux";
import { createOperation } from "../../../redux/slices/operationSlice";
// import { DatePicker } from "antd"

const { Option } = Select;
const { TextArea } = Input;

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

const FORM_FIELDS = [

  //   {
  //   name: "Crop Name",
  //   label: "Crop Name",
  //   span: 12,
  //   component: <Input />,
  //   rules: [],
  // },
  {
    name: "supervisorName",
    label: "Supervisor Name",
    span: 12,
    component: <Input />,
    rules: [],
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
    rules: [{ required: true, message: "Please select the operation type!" }],
  },
  {
    name: "chemicalUsed",
    label: "Chemical Used",
    span: 12,
    component: <Input />,
    rules: [],
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
    rules: [],
  },
  {
    name: "chemicalQuantity",
    label: "Chemical Quantity",
    span: 12,
    component: <Input />,
    rules: [],
  },
  {
    name: "labourMale",
    label: "Labour (Male)",
    span: 6,
    component: <Input type="number" min={0} />,
    rules: [],
  },
  {
    name: "labourFemale",
    label: "Labour (Female)",
    span: 6,
    component: <Input type="number" min={0} />,
    rules: [],
  },
  //  {
  //   name: "Area",
  //   label: "Area (in acres)",
  //   span: 6,
  //   component: <Input type="text" min={1} />,
  //   rules: [],
  // },
  // {
  //   name: "Date",
  //   label: "Date",
  //   span: 6,
  //   component:<DatePicker placeholder="" style={{ width: "100%" }} />,
  //   rules: [],
  // },

  {
    name: "estimatedCost",
    label: "Estimated Cost (Rs)",
    span: 12,
    component: <Input type="number" min={0} />,
    rules: [],
  },
  {
    name: "comments",
    label: "Add Comment",
    span: 12,
    component: <TextArea rows={4} />,
    rules: [],
  },
];

const EventForm = ({
  visible,
  onClose,
  onSave,
  initialData,
  selectedField,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleSubmit = async (values) => {
    if (!selectedField?.selectedField) {
      message.error("Invalid or missing FarmField ID");
      return;
    }

    // Add operationDate and operationTime to the form values before submission
    const submissionValues = {
      ...values,
      operationDate: initialData?.date,
      operationTime: initialData?.time,
    };

    try {
      const result = await dispatch(
        createOperation({
          farmId: selectedField?.selectedField,
          operationData: submissionValues,
        })
      ).unwrap();

      if (result.success) {
        message.success("Operation created successfully!");
        onSave(submissionValues);
        form.resetFields();
        onClose();
      } else {
        message.error("Failed to create operation. Please try again.");
      }
    } catch (error) {
      message.error("An error occurred while creating the operation.");
    }
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} className="flex items-center justify-center gap-4" width={600}>
      <h2 className="text-[#344e41] text-[1.2rem]">Add Operations</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData}
        style={{ width: "100%" }}
        centered
      >
        <Row gutter={16}>
          {FORM_FIELDS.map(({ name, label, span, component, rules }) => (
            <Col span={span} key={name}>
              <Form.Item
                name={name}
                label={label}
                className="text-[0.9rem] text-[#344e41] outline-none"
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
            className="bg-[#344e41] px-[50px] text-base font-bold text-white"
          >
            Add Operations
          </Button>
        </Row>
      </Form>
    </Modal>
  );
};

export default EventForm;
