export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export function validateImage(file: File): UploadResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Chỉ chấp nhận JPG, PNG, WEBP, GIF" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File vượt quá 5MB" };
  }
  return { success: true };
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const validation = validateImage(file);
  if (!validation.success) return validation;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: "Upload failed" };
  }
}
