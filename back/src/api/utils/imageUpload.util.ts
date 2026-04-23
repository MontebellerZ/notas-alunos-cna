import fs from "fs/promises";
import { BadRequestError } from "../errors/errors";

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function isJpegSignature(buffer: Buffer) {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function isPngSignature(buffer: Buffer) {
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return pngSignature.every((value, index) => buffer[index] === value);
}

function isGifSignature(buffer: Buffer) {
  const gif87a = Buffer.from("GIF87a", "ascii");
  const gif89a = Buffer.from("GIF89a", "ascii");
  return buffer.subarray(0, 6).equals(gif87a) || buffer.subarray(0, 6).equals(gif89a);
}

function isWebpSignature(buffer: Buffer) {
  const riff = Buffer.from("RIFF", "ascii");
  const webp = Buffer.from("WEBP", "ascii");
  return buffer.subarray(0, 4).equals(riff) && buffer.subarray(8, 12).equals(webp);
}

function hasValidSignatureForMimeType(buffer: Buffer, mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return isJpegSignature(buffer);
    case "image/png":
      return isPngSignature(buffer);
    case "image/gif":
      return isGifSignature(buffer);
    case "image/webp":
      return isWebpSignature(buffer);
    default:
      return false;
  }
}

async function removeUploadedFile(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignora remoção quando arquivo já não existe.
  }
}

export function isAllowedImageMimeType(mimeType?: string) {
  if (!mimeType) return false;
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType);
}

export function getExtensionFromImageMimeType(mimeType?: string) {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".jpg";
  }
}
