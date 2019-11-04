export function isEditable(contentType?: string | null, language?: string | null) {
  return language || (contentType && contentType.startsWith("text/"));
}
