import { API_URL } from "../constants/api";

export function formatPrice(price) {
  if (price === null || price === undefined || price === "") return 0;

  const num = Number(price);
  if (isNaN(num)) return String(price);

  if (Number.isInteger(num)) return num.toLocaleString("vi-VN");

  const s = num.toFixed(3).replace(/\.?0+$/, "");
  const parts = s.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return parts[1] ? `${intPart},${parts[1]}` : intPart;
}

export function formatImage(uri) {
  const defaultSource = require("../assets/images/background_default.png");

  if (!uri || typeof uri !== "string") {
    return defaultSource;
  }

  if (uri.startsWith("http")) {
    return { uri };
  }

  const baseUrl = API_URL.replace(/\/api\/?$/, "");

  const finalUri = `${baseUrl}${uri.startsWith("/") ? uri : `/${uri}`}`;

  return { uri: finalUri };
}
