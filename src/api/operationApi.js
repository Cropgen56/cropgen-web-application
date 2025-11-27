import api from "./api.js";

const API_URL = process.env.REACT_APP_API_URL;

export const createOperationAPI = async ({ farmId, operationData }) => {
  const response = await api.post(`${API_URL}/api/operation/${farmId}/create`, {
    supervisorName: operationData.supervisorName,
    operationType: operationData.operationType,
    progress: operationData.progress,
    chemicalUsed: operationData.chemicalUsed,
    chemicalQuantity: operationData.chemicalQuantity,
    labourMale: Number(operationData.labourMale),
    labourFemale: Number(operationData.labourFemale),
    estimatedCost: Number(operationData.estimatedCost),
    comments: operationData.comments,
    operationDate: operationData.operationDate,
    operationTime: operationData.operationTime,
  });
  return response.data;
};

export const getOperationsByFarmFieldAPI = async ({ farmId }) => {
  const response = await api.get(`${API_URL}/api/operation/${farmId}/get`);
  return response.data;
};

export const deleteOperationAPI = async (operationId) => {
  const response = await api.delete(`${API_URL}/api/operation/${operationId}`);
  return response.data;
};
