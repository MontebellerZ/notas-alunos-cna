import path from "path";

class StoragePaths {
  static uploadsRoute = "/uploads";

  static profileImagesDir = "perfil";

  static getUploadsRootDir() {
    return path.resolve(__dirname, "..", "..", "uploads");
  }

  static getProfileImagesDir() {
    return path.resolve(this.getUploadsRootDir(), this.profileImagesDir);
  }

  static buildProfileImagePath(filename: string) {
    return path.posix.join(this.uploadsRoute, this.profileImagesDir, filename);
  }

  static isManagedUploadPath(filePath?: string | null) {
    return Boolean(filePath?.startsWith(`${this.uploadsRoute}/`));
  }

  static resolveStoredFileToDiskPath(filePath: string) {
    const normalizedPath = filePath.replace(/\\/g, "/");
    const relativePath = normalizedPath.replace(`${this.uploadsRoute}/`, "");
    const segments = relativePath.split("/").filter(Boolean);

    return path.resolve(this.getUploadsRootDir(), ...segments);
  }
}

export default StoragePaths;