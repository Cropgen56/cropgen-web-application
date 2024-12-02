import React from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col } from "antd";
import "./EventForm.css";

const EventForm = ({ visible, onClose, onSave, initialData }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
    }
  }, [initialData, form]);

  const handleSubmit = (values) => {
    onSave(values);
    console.log(values);
    form.resetFields();
  };

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
    >
      <div style={{ textAlign: "start", marginBottom: "20px" }}>
        <h2 className="add-operation-title">Add Operations</h2>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData}
        style={{ width: "100%", height: "100%" }}
      >
        <Row gutter={16} className="add-operation-form-row">
          <Col span={12}>
            <Form.Item
              name="cropName"
              className="add-operation-form-label"
              label="Crop Name"
              rules={[{ message: "Please enter the crop name!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="supervisorName"
              className="add-operation-form-label"
              label="Supervisor Name"
              rules={[{ message: "Please enter the supervisor name!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} className="add-operation-form-row">
          <Col span={12}>
            <Form.Item
              name="operationType"
              label="Operation Type"
              className="add-operation-form-label"
              rules={[{ message: "Please select the operation type!" }]}
            >
              <Select>
                <Select.Option value="tilage">Tilage</Select.Option>
                <Select.Option value="cultivator">Cultivator</Select.Option>
                <Select.Option value="sowing">Sowing</Select.Option>
                <Select.Option value="fransplanting">
                  Fransplanting
                </Select.Option>
                <Select.Option value="fertilizer application">
                  Fertilizer application
                </Select.Option>
                <Select.Option value="harvesting">Harvesting</Select.Option>
                <Select.Option value="spray">Spray</Select.Option>
                <Select.Option value=" interculture operation - weeding, hand pic">
                  Interculture Operation - weeding, hand pic
                </Select.Option>
                <Select.Option value="spray">Other</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="chemicalUsed"
              label="Chemical Used"
              className="add-operation-form-label"
              rules={[{ message: "Please enter the chemical used!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} className="add-operation-form-row">
          <Col span={12}>
            <Form.Item
              name="progress"
              label="Progress"
              className="add-operation-form-label"
              rules={[{ message: "Please select the progress!" }]}
            >
              <Select>
                <Select.Option value="completed">Completed</Select.Option>
                <Select.Option value="inprogress">In Progress</Select.Option>
                <Select.Option value="started">Started</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="chemicalQuantity"
              label="Chemical Quantity"
              className="add-operation-form-label"
              rules={[{ message: "Please enter the quantity!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} className="add-operation-form-row">
          <Col span={6}>
            <Form.Item
              name="labourMale"
              className="add-operation-form-label"
              label="Labour (Male)"
              rules={[{ message: "Please enter male labour count!" }]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="labourFemale"
              label="Labour (Female)"
              className="add-operation-form-label"
              rules={[{ message: "Please enter female labour count!" }]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="areaInAcre"
              label="Area in Acre"
              className="add-operation-form-label"
              rules={[{ message: "Please enter area in acres!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="date"
              className="add-operation-form-label"
              label="Date"
              rules={[{ message: "Please select a date!" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} className="add-operation-form-row">
          <Col span={12}>
            <Form.Item
              name="estimatedCost"
              label="Estimated Cost"
              className="add-operation-form-label"
              rules={[{ message: "Please enter the estimated cost!" }]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12} className="add-operation-form-row">
          <Col span={12}>
            <Form.Item
              name="comments"
              className="add-operation-form-label"
              label="Add Comment"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
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
