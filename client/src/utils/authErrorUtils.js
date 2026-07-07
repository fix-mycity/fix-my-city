export const cleanBackendMessage = (message) =>
  String(message || "Invalid value.").replace(/^Value error,\s*/i, "");

export const getBackendFieldErrors = (error, fieldNames) => {
  const detail = error?.detail ?? error;
  const fields = new Set(fieldNames);
  const errors = {};
  const globalMessages = [];

  if (Array.isArray(detail)) {
    detail.forEach((item) => {
      let fieldName;
      for (let index = (item.loc?.length || 0) - 1; index >= 0; index -= 1) {
        if (fields.has(item.loc[index])) {
          fieldName = item.loc[index];
          break;
        }
      }

      const message = cleanBackendMessage(item.msg || item.message);

      if (fieldName) {
        errors[fieldName] = message;
      } else {
        globalMessages.push(message);
      }
    });
  } else if (detail && typeof detail === "object") {
    Object.entries(detail).forEach(([fieldName, message]) => {
      if (fields.has(fieldName)) {
        errors[fieldName] = cleanBackendMessage(message);
      }
    });
  }

  return { errors, globalMessages };
};

export const getGlobalErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") return error;
  if (typeof error?.detail === "string") return error.detail;
  if (typeof error?.message === "string") return error.message;
  return fallbackMessage;
};
