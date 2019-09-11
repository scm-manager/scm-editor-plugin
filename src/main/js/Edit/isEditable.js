// @flow

export function isEditable(contentType: string, language: string) {
  return language || contentType && contentType.startsWith("text/");
}
