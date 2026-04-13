const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

export const sanitizeText = (input: unknown, maxLength = 120): string => {
  if (typeof input !== "string") return "";
  return input
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
};

export const sanitizeEmail = (input: unknown): string => {
  return sanitizeText(input, 254).toLowerCase();
};

export const sanitizeId = (input: unknown): string => {
  return sanitizeText(input, 64);
};
