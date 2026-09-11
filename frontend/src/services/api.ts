import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("infraai_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Step 1: upload the image before an asset exists.
export async function uploadInspectionImage(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/api/inspections/upload",
    formData
  );

  return response.data;
}

// Step 2: create the asset and inspection after the
// user has entered the inspection details.
export async function createInspection(data: {
  upload_id: string;
  name: string;
  type: string;
  location: string;
  description?: string;
  inspection_date?: string;
  deterioration_status?: string;
}) {
  const response = await api.post(
    "/api/inspections/create",
    null,
    {
      params: data,
    }
  );

  return response.data;
}

// Run image quality -> YOLO -> severity -> risk.
export async function analyzeInspection(inspectionId: string) {
  const response = await api.post(
    `/api/inspections/${inspectionId}/analyze`
  );

  return response.data;
}

// Retrieve a stored inspection.
export async function getInspection(inspectionId: string) {
  const response = await api.get(
    `/api/inspections/${inspectionId}`
  );

  return response.data;
}

// Retrieve defects for an inspection.
export async function getInspectionDefects(inspectionId: string) {
  const response = await api.get(
    `/api/inspections/${inspectionId}/defects`
  );

  return response.data;
}

// Retrieve an authenticated image from MongoDB as a browser blob.
export async function getInspectionImage(imageId: string) {
  const response = await api.get(
    `/api/inspections/image/${imageId}`,
    {
      responseType: "blob",
    }
  );

  return response.data;
}

export const uploadInspection = uploadInspectionImage;

export default api;
