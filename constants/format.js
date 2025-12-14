export function formatPrice(price) {
  if (price === null || price === undefined || price === "") return "";

  const num = Number(price);
  if (isNaN(num)) return String(price);

  if (Number.isInteger(num)) return num.toLocaleString("vi-VN");

  const s = num.toFixed(3).replace(/\.?0+$/, "");
  const parts = s.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return parts[1] ? `${intPart},${parts[1]}` : intPart;
};

export function formatImage(uri) {
  const defaultSource = require("../assets/images/background_default.png");

  if (!uri) return defaultSource;

  const isBase64 = typeof uri === "string" && uri.startsWith("data:image/");
  const isValidUrl = typeof uri === "string" && uri.startsWith("http") && uri.length > 10;

  if (isBase64 || isValidUrl) {
    return {uri: uri};
  }
  
  return defaultSource;
}

export function formatOrderId(orderId) {
  const baseId = "#DH264";
  
  return `${baseId}${orderId < 10 ? orderId : "00" + orderId >= 10 && orderId < 100 ? "0" + orderId : orderId}`;
}