const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("The server returned an invalid response. Please try again shortly.");
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "The request could not be completed.");
  }
  return result;
}

export function toStoreProduct(product) {
  const category = {
    Women: "Women's Fashion",
    Men: "Men's Traditional",
  }[product.category] || product.category;
  const clothingCategory = category !== "Accessories";

  return {
    ...product,
    category,
    sizes: clothingCategory ? ["S", "M", "L", "XL", "XXL"] : undefined,
    badge: product.stock > 0 ? "In stock" : "Out of stock",
    description: product.description || "",
  };
}

export function toStoreOrder(order) {
  return {
    ...order,
    date: new Date(order.createdAt).toLocaleDateString("en-ET", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    address: order.deliveryAddress,
    items: order.items.map((item) => ({
      ...item,
      id: item.product,
      price: item.unitPrice,
      size: item.size || "One size",
    })),
  };
}
