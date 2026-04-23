import multer from "multer";
import fs from "fs";
import StoragePaths from "./storagePaths";
import { AuthRequest } from "../api/middleware/auth.middleware";
import {
  getExtensionFromImageMimeType,
  isAllowedImageMimeType,
} from "../api/utils/imageUpload.util";
import { BadRequestError } from "../api/errors/errors";

export class ProfileMulter {
  static storage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      const profileUploadDir = StoragePaths.getProfileImagesDir();
      fs.mkdirSync(profileUploadDir, { recursive: true });
      cb(null, profileUploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const usuario = (req as AuthRequest).usuario;
      const safeExt = getExtensionFromImageMimeType(file.mimetype);
      const filename = `usuario-${usuario?.id ?? "anon"}-${Date.now()}${safeExt}`;
      cb(null, filename);
    },
  });

  static upload = multer({
    storage: this.storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req: any, file: any, cb: any) => {
      if (isAllowedImageMimeType(file.mimetype)) {
        cb(null, true);
        return;
      }

      cb(new BadRequestError("Formato de imagem inválido."));
    },
  });
}
