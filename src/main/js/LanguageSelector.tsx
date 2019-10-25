import React, {FC, useState} from "react";
import {Select} from "@scm-manager/ui-components";
import languages from "./languages";

const languageSelectItems = languages.map(lang => {
  return {
    value: lang,
    label: lang
  }
});

type Props = {
  selected?: string;
  disabled?: boolean;
  onChange: (language: string) => void;
};

const LanguageSelector: FC<Props> = ({disabled, selected = "text", onChange}) => {
  const [language, setLanguage] = useState(selected);
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    onChange(lang);
  };

  return (
  <Select
    disabled={disabled}
    options={languageSelectItems}
    value={language}
    onChange={changeLanguage}
  />
)};

export default LanguageSelector;
