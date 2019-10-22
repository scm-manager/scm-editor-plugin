export function isEditable(contentType: string, language: string, length: number) {
  const result = language || length === 0 || (contentType && contentType.startsWith("text/"));
  return result;
}
