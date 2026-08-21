import axios from "axios";
import { DISEASE_API_URL } from "../config/envUrls";

const diseaseHttp = axios.create({
  baseURL: DISEASE_API_URL,
  timeout: 120_000,
});

export const CROP_CONFIDENCE_MIN = 0.4;
export const CROP_CONFIDENCE_HIGH = 0.7;

/** Fallback when /metadata has not yet rolled out all_crops (33). */
export const FALLBACK_ALL_CROPS = [
  "apple",
  "bean",
  "bell_pepper",
  "blackgram_greengram",
  "cherry",
  "chilli",
  "coconut",
  "coffee",
  "corn",
  "cotton",
  "dragon_fruit",
  "eggplant",
  "grape",
  "groundnut",
  "jute",
  "lemon",
  "mango",
  "okra",
  "onion",
  "orange",
  "paddy",
  "peach",
  "pineapple",
  "potato",
  "pumpkin",
  "raspberry",
  "snake_gourd",
  "soybean",
  "strawberry",
  "sugarcane",
  "tea",
  "tomato",
  "wheat",
];

export const FALLBACK_ALL_CROPS_DISPLAY = {
  apple: "Apple",
  bean: "Bean",
  bell_pepper: "Bell Pepper",
  blackgram_greengram: "Blackgram / Greengram",
  cherry: "Cherry",
  chilli: "Chilli",
  coconut: "Coconut",
  coffee: "Coffee",
  corn: "Corn / Maize",
  cotton: "Cotton",
  dragon_fruit: "Dragon Fruit",
  eggplant: "Eggplant / Brinjal",
  grape: "Grape",
  groundnut: "Groundnut",
  jute: "Jute",
  lemon: "Lemon",
  mango: "Mango",
  okra: "Okra / Bhindi",
  onion: "Onion",
  orange: "Orange",
  paddy: "Paddy / Rice",
  peach: "Peach",
  pineapple: "Pineapple",
  potato: "Potato",
  pumpkin: "Pumpkin",
  raspberry: "Raspberry",
  snake_gourd: "Snake Gourd",
  soybean: "Soybean",
  strawberry: "Strawberry",
  sugarcane: "Sugarcane",
  tea: "Tea",
  tomato: "Tomato",
  wheat: "Wheat",
};

export const FALLBACK_DISEASE_CROPS = [
  "apple",
  "bean",
  "bell_pepper",
  "blackgram",
  "cherry",
  "chilli",
  "dragon_fruit",
  "grape",
  "groundnut",
  "lemon",
  "mango",
  "paddy",
  "peach",
  "potato",
  "snake_gourd",
  "soybean",
  "strawberry",
  "tomato",
];

const CROP_ALIASES = {
  rice: "paddy",
  paddy: "paddy",
  "paddy / rice": "paddy",
  maize: "corn",
  "corn / maize": "corn",
  chilli: "chilli",
  chili: "chilli",
  chillies: "chilli",
  "bell pepper": "bell_pepper",
  bellpepper: "bell_pepper",
  "dragon fruit": "dragon_fruit",
  dragonfruit: "dragon_fruit",
  "snake gourd": "snake_gourd",
  snakegourd: "snake_gourd",
  "ground nut": "groundnut",
  groundnuts: "groundnut",
  soyabean: "soybean",
  soya: "soybean",
  brinjal: "eggplant",
  "eggplant / brinjal": "eggplant",
  bhindi: "okra",
  "okra / bhindi": "okra",
  "blackgram / greengram": "blackgram_greengram",
  blackgram: "blackgram_greengram",
  "black gram": "blackgram_greengram",
  greengram: "blackgram_greengram",
  "green gram": "blackgram_greengram",
  moong: "blackgram_greengram",
};

export function normalizeCropKey(name) {
  if (!name || typeof name !== "string") return "";
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  if (CROP_ALIASES[cleaned]) return CROP_ALIASES[cleaned];
  return cleaned.replace(/\s+/g, "_");
}

/** Phase-1 crop key → Phase-2 detect-disease crop key. */
export function toDiseaseCropKey(cropKey) {
  const key = normalizeCropKey(cropKey);
  if (key === "blackgram_greengram") return "blackgram";
  return key;
}

export function cropDisplayName(cropKey, displayMap = FALLBACK_ALL_CROPS_DISPLAY) {
  const key = normalizeCropKey(cropKey);
  if (displayMap[key]) return displayMap[key];
  if (FALLBACK_ALL_CROPS_DISPLAY[key]) return FALLBACK_ALL_CROPS_DISPLAY[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseDiseaseMetadata(meta = {}) {
  const allCrops =
    Array.isArray(meta.all_crops) && meta.all_crops.length > 0
      ? meta.all_crops
      : FALLBACK_ALL_CROPS;
  const display = {
    ...FALLBACK_ALL_CROPS_DISPLAY,
    ...(meta.all_crops_display && typeof meta.all_crops_display === "object"
      ? meta.all_crops_display
      : {}),
  };
  const diseaseCrops =
    Array.isArray(meta.disease_detection_crops) &&
    meta.disease_detection_crops.length > 0
      ? meta.disease_detection_crops
      : Array.isArray(meta.supported_crops) && meta.supported_crops.length > 0
        ? meta.supported_crops
        : FALLBACK_DISEASE_CROPS;
  return {
    allCrops,
    display,
    diseaseCrops,
    stage0Active: meta.stage0_active !== false,
    phase1Active: meta.phase1_active !== false,
    phase2Active: meta.phase2_active !== false,
  };
}

const MAX_UPLOAD_BYTES = 900 * 1024;
const MAX_IMAGE_DIMENSION = 1600;

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the image."));
    };
    img.src = url;
  });
}

function canvasToJpegFile(canvas, quality, name) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not compress the image."));
          return;
        }
        resolve(
          new File([blob], name.replace(/\.[^.]+$/, "") + ".jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          }),
        );
      },
      "image/jpeg",
      quality,
    );
  });
}

/** Shrink phone photos so nginx does not return 413 Request Entity Too Large. */
export async function compressImageForDiseaseApi(file) {
  if (!file || !file.type?.startsWith("image/")) return file;
  if (file.size <= MAX_UPLOAD_BYTES) return file;

  try {
    const img = await loadImageElement(file);
    const longest = Math.max(img.width, img.height) || 1;
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.82;
    let compressed = await canvasToJpegFile(canvas, quality, file.name);
    while (compressed.size > MAX_UPLOAD_BYTES && quality > 0.45) {
      quality -= 0.12;
      compressed = await canvasToJpegFile(canvas, quality, file.name);
    }
    return compressed;
  } catch {
    return file;
  }
}

export function isDiseaseDetectionCrop(cropKey, diseaseCrops = []) {
  const set = new Set(diseaseCrops);
  const key = normalizeCropKey(cropKey);
  const diseaseKey = toDiseaseCropKey(key);
  return set.has(key) || set.has(diseaseKey);
}

/** Normalize API confidence (0–1 or 0–100) to 0–1. */
export function cropConfidenceScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n > 1 ? n / 100 : n;
}

export function isLeafGateAccepted(gate) {
  const status = String(gate?.status || "").toLowerCase();
  return status === "leaf" || status === "accepted" || status === "skipped";
}

export function getDiseaseApiErrorMessage(error) {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (status === 413) {
    return "The photo is too large. Please try a smaller image or retake the photo.";
  }
  if (status === 404) {
    return "Symptoms and treatment notes are not available for this disease yet.";
  }
  if (error?.code === "ECONNABORTED") {
    return "Disease analysis timed out. Please try again with a clearer leaf photo.";
  }
  if (!error?.response) {
    return "Could not reach the disease detection service. Check your connection.";
  }
  return error?.message || "Disease detection failed.";
}

export function leafRejectionMessage(gate) {
  const objectName = String(gate?.detected_object || "").trim();
  if (objectName) {
    return `Leaf not detected. Detected “${objectName}” instead. Please retake the photo.`;
  }
  const status = String(gate?.status || "").toLowerCase();
  if (status === "no_object_detected") {
    return "Leaf not detected. Please retake the photo with a clear leaf.";
  }
  const apiMessage = String(gate?.message || "").trim();
  if (apiMessage && !/%|confidence/i.test(apiMessage)) return apiMessage;
  return "Leaf not detected. Please retake the photo with a clear leaf.";
}

export function parseLeafRejection(errorOrGate) {
  if (errorOrGate && typeof errorOrGate === "object" && errorOrGate.status) {
    return {
      status: errorOrGate.status,
      message: errorOrGate.message || "Leaf not detected.",
      detected_object: errorOrGate.detected_object || null,
    };
  }
  const data = errorOrGate?.response?.data;
  if (data?.detected_object || data?.status) {
    return {
      status: data.status || "rejected",
      message: data.message || data.detail || "Leaf not detected.",
      detected_object: data.detected_object || null,
    };
  }
  const detail = typeof data?.detail === "string" ? data.detail : "";
  const match = detail.match(/Detected ['"]([^'"]+)['"]/i);
  return {
    status: "rejected",
    message: detail || "Leaf not detected.",
    detected_object: match?.[1] || null,
  };
}

export async function getDiseaseMetadata() {
  const { data } = await diseaseHttp.get("/api/v1/metadata");
  return parseDiseaseMetadata(data);
}

/**
 * Phase 0: standalone leaf gate.
 * HTTP 200 for leaf, rejected, and no_object_detected.
 * 503 → skipped so Phase 1 can still run.
 */
export async function runLeafGate(file) {
  const upload = await compressImageForDiseaseApi(file);
  const form = new FormData();
  form.append("file", upload);
  try {
    const { data } = await diseaseHttp.post("/api/v1/stage0-gate", form);
    return data;
  } catch (error) {
    if (error?.response?.status === 503) {
      return { status: "skipped", message: "Stage 0 unavailable" };
    }
    throw error;
  }
}

export async function classifyCrop(file, { directResize = false } = {}) {
  const upload = await compressImageForDiseaseApi(file);
  const form = new FormData();
  form.append("file", upload);
  const { data } = await diseaseHttp.post("/api/v1/classify-crop", form, {
    params: { direct_resize: directResize },
  });
  return data;
}

export async function detectDisease(file, crop, { directResize = false } = {}) {
  const upload = await compressImageForDiseaseApi(file);
  const form = new FormData();
  form.append("file", upload);
  const { data } = await diseaseHttp.post("/api/v1/detect-disease", form, {
    params: {
      crop: toDiseaseCropKey(crop),
      direct_resize: directResize,
    },
  });
  return data;
}

export async function getSymptomsControl(crop, disease, lang = "en") {
  const { data } = await diseaseHttp.get("/api/v1/symptoms-control", {
    params: {
      crop: toDiseaseCropKey(crop),
      disease: String(disease || "").trim(),
      lang: lang === "hi" ? "hi" : "en",
    },
  });
  return data;
}

const uniqueDiseaseNames = (diseaseRes) =>
  [
    diseaseRes?.predicted_disease,
    diseaseRes?.disease_en,
    diseaseRes?.raw_disease_label,
    ...(Array.isArray(diseaseRes?.top_k_predictions)
      ? diseaseRes.top_k_predictions.map((item) => item?.disease)
      : []),
  ]
    .map((name) => String(name || "").trim())
    .filter(Boolean)
    .filter((name, index, list) => list.indexOf(name) === index);

/** Returns symptoms payload, or null when the API has no notes for this disease. */
export async function fetchSymptomsControlSafe(crop, diseaseRes, lang = "en") {
  const names = uniqueDiseaseNames(diseaseRes);
  if (!names.length) return null;

  for (const disease of names) {
    try {
      const data = await getSymptomsControl(crop, disease, lang);
      if (data && (data.symptoms?.length || data.control?.length)) return data;
      if (data) return data;
    } catch (error) {
      if (error?.response?.status === 404) continue;
      return null;
    }
  }
  return null;
}
