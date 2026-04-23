function generateImageUrl(foto: string | null): string | null {
  if (!foto) {
    return null;
  }

  if (foto.startsWith("http://") || foto.startsWith("https://") || foto.startsWith("data:")) {
    return foto;
  }

  const baseUrl = import.meta.env.VITE_API_BASEURL;
  return new URL(foto, baseUrl).toString();
}

export default generateImageUrl;
