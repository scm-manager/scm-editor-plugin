// @flow

export function isEditable(
  contentType: string,
  language: string,
  length: number
) {
  let result =
    language ||
    length === 0 ||
    (contentType && contentType.startsWith("text/"));
  return result;
}
