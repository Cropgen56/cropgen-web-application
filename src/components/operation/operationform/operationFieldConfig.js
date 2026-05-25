export const OPERATION_TYPES = [
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

export const PROGRESS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "started", label: "Started" },
];

/**
 * Fields that can appear in the form (operationType is always shown first).
 * Labels can be overridden per operation type via labelOverrides.
 */
export const FIELD_KEYS = {
  SUPERVISOR: "supervisorName",
  OPERATION_TYPE: "operationType",
  CHEMICAL_USED: "chemicalUsed",
  CHEMICAL_QUANTITY: "chemicalQuantity",
  PROGRESS: "progress",
  LABOUR_MALE: "labourMale",
  LABOUR_FEMALE: "labourFemale",
  ESTIMATED_COST: "estimatedCost",
  COMMENTS: "comments",
};

const DEFAULT_LABELS = {
  [FIELD_KEYS.SUPERVISOR]: "Supervisor Name",
  [FIELD_KEYS.OPERATION_TYPE]: "Operation Type",
  [FIELD_KEYS.CHEMICAL_USED]: "Chemical Used",
  [FIELD_KEYS.CHEMICAL_QUANTITY]: "Chemical Quantity",
  [FIELD_KEYS.PROGRESS]: "Progress",
  [FIELD_KEYS.LABOUR_MALE]: "Labour (Male)",
  [FIELD_KEYS.LABOUR_FEMALE]: "Labour (Female)",
  [FIELD_KEYS.ESTIMATED_COST]: "Estimated Cost (Rs)",
  [FIELD_KEYS.COMMENTS]: "Add Comment",
};

const DEFAULT_SPANS = {
  [FIELD_KEYS.SUPERVISOR]: 12,
  [FIELD_KEYS.OPERATION_TYPE]: 12,
  [FIELD_KEYS.CHEMICAL_USED]: 12,
  [FIELD_KEYS.CHEMICAL_QUANTITY]: 12,
  [FIELD_KEYS.PROGRESS]: 12,
  [FIELD_KEYS.LABOUR_MALE]: 6,
  [FIELD_KEYS.LABOUR_FEMALE]: 6,
  [FIELD_KEYS.ESTIMATED_COST]: 12,
  [FIELD_KEYS.COMMENTS]: 24,
};

/** Per operation type: field order, label overrides, and which fields are required */
const OPERATION_TYPE_CONFIG = {
  tillage: {
    fields: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.SUPERVISOR,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.LABOUR_MALE,
      FIELD_KEYS.LABOUR_FEMALE,
      FIELD_KEYS.ESTIMATED_COST,
      FIELD_KEYS.COMMENTS,
    ],
    required: [FIELD_KEYS.OPERATION_TYPE, FIELD_KEYS.PROGRESS],
  },
  cultivator: {
    fields: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.SUPERVISOR,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.LABOUR_MALE,
      FIELD_KEYS.LABOUR_FEMALE,
      FIELD_KEYS.ESTIMATED_COST,
      FIELD_KEYS.COMMENTS,
    ],
    required: [FIELD_KEYS.OPERATION_TYPE, FIELD_KEYS.PROGRESS],
  },
  sowing: {
    fields: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.SUPERVISOR,
      FIELD_KEYS.CHEMICAL_USED,
      FIELD_KEYS.CHEMICAL_QUANTITY,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.LABOUR_MALE,
      FIELD_KEYS.LABOUR_FEMALE,
      FIELD_KEYS.ESTIMATED_COST,
      FIELD_KEYS.COMMENTS,
    ],
    labelOverrides: {
      [FIELD_KEYS.CHEMICAL_USED]: "Seed Variety",
      [FIELD_KEYS.CHEMICAL_QUANTITY]: "Seed Quantity (kg)",
    },
    required: [FIELD_KEYS.OPERATION_TYPE, FIELD_KEYS.PROGRESS],
  },
  transplanting: {
    fields: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.SUPERVISOR,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.LABOUR_MALE,
      FIELD_KEYS.LABOUR_FEMALE,
      FIELD_KEYS.ESTIMATED_COST,
      FIELD_KEYS.COMMENTS,
    ],
    required: [FIELD_KEYS.OPERATION_TYPE, FIELD_KEYS.PROGRESS],
  },
  fertilizer_application: {
    fields: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.SUPERVISOR,
      FIELD_KEYS.CHEMICAL_USED,
      FIELD_KEYS.CHEMICAL_QUANTITY,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.LABOUR_MALE,
      FIELD_KEYS.LABOUR_FEMALE,
      FIELD_KEYS.ESTIMATED_COST,
      FIELD_KEYS.COMMENTS,
    ],
    labelOverrides: {
      [FIELD_KEYS.CHEMICAL_USED]: "Fertilizer Used",
      [FIELD_KEYS.CHEMICAL_QUANTITY]: "Fertilizer Quantity (kg/L)",
    },
    required: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.CHEMICAL_USED,
    ],
  },
  harvesting: {
    fields: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.SUPERVISOR,
      FIELD_KEYS.CHEMICAL_USED,
      FIELD_KEYS.CHEMICAL_QUANTITY,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.LABOUR_MALE,
      FIELD_KEYS.LABOUR_FEMALE,
      FIELD_KEYS.ESTIMATED_COST,
      FIELD_KEYS.COMMENTS,
    ],
    labelOverrides: {
      [FIELD_KEYS.CHEMICAL_USED]: "Crop Harvested",
      [FIELD_KEYS.CHEMICAL_QUANTITY]: "Yield Quantity (kg)",
    },
    required: [FIELD_KEYS.OPERATION_TYPE, FIELD_KEYS.PROGRESS],
  },
  spray: {
    fields: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.SUPERVISOR,
      FIELD_KEYS.CHEMICAL_USED,
      FIELD_KEYS.CHEMICAL_QUANTITY,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.LABOUR_MALE,
      FIELD_KEYS.LABOUR_FEMALE,
      FIELD_KEYS.ESTIMATED_COST,
      FIELD_KEYS.COMMENTS,
    ],
    labelOverrides: {
      [FIELD_KEYS.CHEMICAL_USED]: "Pesticide / Spray Used",
      [FIELD_KEYS.CHEMICAL_QUANTITY]: "Spray Quantity (L)",
    },
    required: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.CHEMICAL_USED,
      FIELD_KEYS.CHEMICAL_QUANTITY,
    ],
  },
  interculture_operation: {
    fields: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.SUPERVISOR,
      FIELD_KEYS.CHEMICAL_USED,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.LABOUR_MALE,
      FIELD_KEYS.LABOUR_FEMALE,
      FIELD_KEYS.ESTIMATED_COST,
      FIELD_KEYS.COMMENTS,
    ],
    labelOverrides: {
      [FIELD_KEYS.CHEMICAL_USED]: "Herbicide / Tool Used (optional)",
    },
    required: [FIELD_KEYS.OPERATION_TYPE, FIELD_KEYS.PROGRESS],
  },
  other: {
    fields: [
      FIELD_KEYS.OPERATION_TYPE,
      FIELD_KEYS.SUPERVISOR,
      FIELD_KEYS.CHEMICAL_USED,
      FIELD_KEYS.CHEMICAL_QUANTITY,
      FIELD_KEYS.PROGRESS,
      FIELD_KEYS.LABOUR_MALE,
      FIELD_KEYS.LABOUR_FEMALE,
      FIELD_KEYS.ESTIMATED_COST,
      FIELD_KEYS.COMMENTS,
    ],
    required: [FIELD_KEYS.OPERATION_TYPE],
  },
};

const ALL_DATA_KEYS = [
  FIELD_KEYS.SUPERVISOR,
  FIELD_KEYS.CHEMICAL_USED,
  FIELD_KEYS.CHEMICAL_QUANTITY,
  FIELD_KEYS.PROGRESS,
  FIELD_KEYS.LABOUR_MALE,
  FIELD_KEYS.LABOUR_FEMALE,
  FIELD_KEYS.ESTIMATED_COST,
  FIELD_KEYS.COMMENTS,
];

export function getFieldsForOperationType(operationType) {
  const config =
    OPERATION_TYPE_CONFIG[operationType] || OPERATION_TYPE_CONFIG.other;
  const labelOverrides = config.labelOverrides || {};

  return config.fields
    .filter((key) => key !== FIELD_KEYS.OPERATION_TYPE)
    .map((key) => ({
      name: key,
      label: labelOverrides[key] || DEFAULT_LABELS[key],
      span: DEFAULT_SPANS[key] ?? 12,
      required: (config.required || []).includes(key),
    }));
}

export function getOperationTypeFieldConfig(operationType) {
  const config =
    OPERATION_TYPE_CONFIG[operationType] || OPERATION_TYPE_CONFIG.other;
  return {
    operationType: {
      label: DEFAULT_LABELS[FIELD_KEYS.OPERATION_TYPE],
      required: true,
    },
    fields: getFieldsForOperationType(operationType),
    hiddenKeys: ALL_DATA_KEYS.filter((key) => !config.fields.includes(key)),
  };
}

const NUMERIC_KEYS = [
  FIELD_KEYS.LABOUR_MALE,
  FIELD_KEYS.LABOUR_FEMALE,
  FIELD_KEYS.ESTIMATED_COST,
];

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

/** Strip values for fields hidden for the selected operation type */
export function sanitizeOperationPayload(values, operationType, { isUpdate = false } = {}) {
  const { hiddenKeys } = getOperationTypeFieldConfig(operationType);
  const sanitized = { ...values };

  hiddenKeys.forEach((key) => {
    if (isUpdate) {
      sanitized[key] = NUMERIC_KEYS.includes(key) ? null : "";
    } else {
      delete sanitized[key];
    }
  });

  sanitized.labourMale = parseOptionalNumber(sanitized.labourMale);
  sanitized.labourFemale = parseOptionalNumber(sanitized.labourFemale);
  sanitized.estimatedCost = parseOptionalNumber(sanitized.estimatedCost);

  return sanitized;
}
