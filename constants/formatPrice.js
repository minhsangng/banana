export function formatPrice(price) {
    if (price === null || price === undefined || price === "") return "";

    const num = Number(price);
    if (isNaN(num)) return String(price);

    if (Number.isInteger(num)) return num.toLocaleString("vi-VN");

    const s = num.toFixed(3).replace(/\.?0+$/, "");
    const parts = s.split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return parts[1] ? `${intPart},${parts[1]}` : intPart;
  }