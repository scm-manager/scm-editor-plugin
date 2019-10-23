import languages from "./languages";

export const defaultLanguage = "text";

export default function(language: string): string {
  if (language) {
    const lowerCaseLanguage = language.toLowerCase();
    if (languages.indexOf(lowerCaseLanguage) >= 0) {
      return lowerCaseLanguage;
    }
  }
  return defaultLanguage;
}
