export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const data = err?.response?.data;
  if (!data) {
    if (err?.message === "Network Error") {
      return "Cannot reach the server. Make sure the Django backend is running on port 8000.";
    }
    return fallback;
  }
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) return data.detail.join(" ");
  if (typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const text = Array.isArray(messages) ? messages.join(" ") : String(messages);
        return `${field.replace("_", " ")}: ${text}`;
      })
      .join(" ");
  }
  return fallback;
}
