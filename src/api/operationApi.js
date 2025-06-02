import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// create operation API
export const createOperationAPI = async ({ farmId, operationData }) => {
  const response = await axios.post(
    `${API_URL}/api/operation/${farmId}/create`,
    {
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
    }
  );
  return response.data;
};

// create operation API
export const getOperationsByFarmFieldAPI = async ({ farmId }) => {
  const response = await axios.get(`${API_URL}/api/operation/${farmId}/get`);
  return response.data;
};
