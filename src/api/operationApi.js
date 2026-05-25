import api from "./api.js";

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

export const createOperationAPI = async ({ farmId, operationData }) => {
  const response = await api.post(`/api/operation/${farmId}/create`, {
    supervisorName: operationData.supervisorName,
    operationType: operationData.operationType,
    progress: operationData.progress,
    chemicalUsed: operationData.chemicalUsed,
    chemicalQuantity: operationData.chemicalQuantity,
    labourMale: toOptionalNumber(operationData.labourMale),
    labourFemale: toOptionalNumber(operationData.labourFemale),
    estimatedCost: toOptionalNumber(operationData.estimatedCost),
    comments: operationData.comments,
    operationDate: operationData.operationDate,
    operationTime: operationData.operationTime,
  });
  return response.data;
};

export const getOperationsByFarmFieldAPI = async ({ farmId }) => {
  const response = await api.get(`/api/operation/${farmId}/get`);
  return response.data;
};

export const updateOperationAPI = async ({ operationId, operationData }) => {
  const response = await api.put(`/api/operation/${operationId}`, {
    supervisorName: operationData.supervisorName,
    operationType: operationData.operationType,
    progress: operationData.progress,
    chemicalUsed: operationData.chemicalUsed,
    chemicalQuantity: operationData.chemicalQuantity,
    labourMale: operationData.labourMale,
    labourFemale: operationData.labourFemale,
    estimatedCost: operationData.estimatedCost,
    comments: operationData.comments,
  });
  return response.data;
};

export const deleteOperationAPI = async (operationId) => {
  const response = await api.delete(`/api/operation/${operationId}`);
  return response.data;
};
