import React, { useEffect, useMemo } from "react";
import { Modal, Form, Input, Select, Button, Row, Col, message } from "antd";
import { useDispatch } from "react-redux";
import {
  createOperation,
  updateOperation,
} from "../../../redux/slices/operationSlice";
import {
  OPERATION_TYPES,
  PROGRESS_OPTIONS,
  FIELD_KEYS,
  getOperationTypeFieldConfig,
  sanitizeOperationPayload,
} from "./operationFieldConfig";
import { formatOperationType } from "../operationUtils";
import { X, Calendar, ClipboardList } from "lucide-react";
import "../operations.css";

const { Option } = Select;
const { TextArea } = Input;

const EventForm = ({
  visible,
  onClose,
  onSave,
  initialData,
  farmId,
  selectedField,
  fieldName,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const dispatch = useDispatch();
  const effectiveFarmId = farmId ?? selectedField;

  const operationId = initialData?._id;
  const isEditMode = Boolean(operationId);

  const selectedOperationType = Form.useWatch("operationType", form);

  const fieldConfig = useMemo(
    () => getOperationTypeFieldConfig(selectedOperationType),
    [selectedOperationType]
  );

  useEffect(() => {
    if (!visible) return;

    if (initialData?.operationType || initialData?.supervisorName) {
      const { date, time, start, end, farmField, createdAt, updatedAt, __v, ...formValues } =
        initialData;
      form.setFieldsValue({
        supervisorName: formValues.supervisorName ?? undefined,
        operationType: formValues.operationType ?? undefined,
        chemicalUsed: formValues.chemicalUsed ?? undefined,
        chemicalQuantity: formValues.chemicalQuantity ?? undefined,
        progress: formValues.progress ?? undefined,
        labourMale: formValues.labourMale ?? undefined,
        labourFemale: formValues.labourFemale ?? undefined,
        estimatedCost: formValues.estimatedCost ?? undefined,
        comments: formValues.comments ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form, visible]);

  const handleOperationTypeChange = (value) => {
    const { hiddenKeys } = getOperationTypeFieldConfig(value);
    const cleared = {};
    hiddenKeys.forEach((key) => {
      cleared[key] = undefined;
    });
    form.setFieldsValue(cleared);
  };

  const renderFieldInput = (fieldName, label) => {
    switch (fieldName) {
      case FIELD_KEYS.PROGRESS:
        return (
          <Select placeholder="Select status" allowClear size="large">
            {PROGRESS_OPTIONS.map(({ value, label: optLabel }) => (
              <Option key={value} value={value}>
                {optLabel}
              </Option>
            ))}
          </Select>
        );
      case FIELD_KEYS.LABOUR_MALE:
      case FIELD_KEYS.LABOUR_FEMALE:
      case FIELD_KEYS.ESTIMATED_COST:
        return (
          <Input
            type="number"
            min={0}
            size="large"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        );
      case FIELD_KEYS.COMMENTS:
        return (
          <TextArea
            rows={4}
            size="large"
            placeholder="Notes, equipment used, weather conditions..."
          />
        );
      default:
        return (
          <Input size="large" placeholder={`Enter ${label.toLowerCase()}`} />
        );
    }
  };

  const buildRules = (field) => {
    if (!field.required) return [];
    return [
      {
        required: true,
        message: `Please enter ${field.label.replace("(optional)", "").trim()}`,
      },
    ];
  };

  const handleSubmit = async (values) => {
    if (!effectiveFarmId) {
      message.error("Please select a farm first.");
      return;
    }

    if (!values.operationType) {
      message.error("Please select an operation type.");
      return;
    }

    const sanitized = sanitizeOperationPayload(values, values.operationType, {
      isUpdate: isEditMode,
    });

    const submissionValues = {
      ...sanitized,
      operationDate: initialData?.date ?? initialData?.operationDate,
      operationTime: initialData?.time ?? initialData?.operationTime,
    };

    if (!isEditMode && (!submissionValues.operationDate || !submissionValues.operationTime)) {
      message.error("Please select a date on the calendar.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await dispatch(
          updateOperation({ operationId, operationData: sanitized })
        ).unwrap();
        message.success("Operation updated successfully!");
      } else {
        await dispatch(
          createOperation({ farmId: effectiveFarmId, operationData: submissionValues })
        ).unwrap();
        message.success("Operation scheduled successfully!");
      }
      onSave(submissionValues);
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(
        error?.message ||
          `Failed to ${isEditMode ? "update" : "create"} operation. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const scheduledMoment =
    initialData?.date && initialData?.time
      ? `${initialData.date} · ${initialData.time?.slice(0, 5)}`
      : null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="100%"
      style={{ maxWidth: 640, top: 20, paddingBottom: 0 }}
      destroyOnClose
      closable={false}
      centered={false}
      className="operation-form-modal"
      styles={{ mask: { backdropFilter: "blur(4px)" } }}
    >
      <div className="bg-gradient-to-r from-[#344e41] to-[#2b4035] px-4 sm:px-5 py-4 text-white relative shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/15 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="flex items-start gap-3 pr-8">
          <div className="p-2.5 rounded-xl bg-white/15 shrink-0">
            <ClipboardList size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">
              {isEditMode ? "Edit Operation" : "Schedule Operation"}
            </h2>
            {fieldName && (
              <p className="text-emerald-100/80 text-sm mt-0.5">{fieldName}</p>
            )}
            {scheduledMoment && (
              <p className="flex items-center gap-1.5 text-emerald-100/70 text-xs mt-2">
                <Calendar size={13} />
                {scheduledMoment}
              </p>
            )}
            {isEditMode && selectedOperationType && (
              <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-white/15 capitalize">
                {formatOperationType(selectedOperationType)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="operation-form-scroll">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="px-4 sm:px-5 py-4"
        preserve={false}
        requiredMark="optional"
      >
        <Form.Item
          name={FIELD_KEYS.OPERATION_TYPE}
          label={
            <span className="font-semibold text-ember-sidebar">
              Operation Type <span className="text-red-500">*</span>
            </span>
          }
          rules={[{ required: true, message: "Please select the operation type" }]}
        >
          <Select
            placeholder="What type of field work?"
            onChange={handleOperationTypeChange}
            showSearch
            size="large"
            optionFilterProp="children"
          >
            {OPERATION_TYPES.map(({ value, label }) => (
              <Option key={value} value={value}>
                {label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {!selectedOperationType ? (
          <div className="rounded-xl border border-dashed border-ember-border bg-ember-card/50 py-10 px-4 text-center mb-4">
            <ClipboardList className="mx-auto mb-3 text-ember-sidebar/30" size={36} />
            <p className="text-ember-text-secondary text-sm">
              Select an operation type above to show the relevant form fields
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-ember-text-tertiary mb-4 -mt-1">
              Fields below are tailored for{" "}
              <span className="font-medium text-ember-sidebar">
                {formatOperationType(selectedOperationType)}
              </span>
            </p>
            <Row gutter={[12, 0]}>
              {fieldConfig.fields.map((field) => (
                <Col
                  xs={24}
                  sm={field.span === 24 || field.name === FIELD_KEYS.COMMENTS ? 24 : 12}
                  key={field.name}
                >
                  <Form.Item
                    name={field.name}
                    label={
                      <span className="font-medium text-ember-sidebar text-[0.85rem]">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                      </span>
                    }
                    rules={buildRules(field)}
                  >
                    {renderFieldInput(field.name, field.label)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-ember-border mt-1 sticky bottom-0 bg-white pb-1">
          <Button
            size="large"
            onClick={onClose}
            className="flex-1 sm:flex-none sm:min-w-[100px] !h-10 rounded-lg font-medium"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            disabled={!selectedOperationType || submitting}
            loading={submitting}
            className="flex-1 !h-10 rounded-lg font-semibold !bg-ember-sidebar hover:!bg-ember-sidebar-hover border-none"
          >
            {isEditMode ? "Save Changes" : "Schedule Operation"}
          </Button>
        </div>
      </Form>
      </div>
    </Modal>
  );
};

export default EventForm;
