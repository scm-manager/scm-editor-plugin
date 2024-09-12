/*
 * Copyright (c) 2020 - present Cloudogu GmbH
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import React, { FC, useEffect, useState } from "react";
import { Select } from "@scm-manager/ui-components";
import { languages } from "@scm-manager/scm-code-editor-plugin";

const languageSelectItems = languages.map(lang => {
  return {
    value: lang,
    label: lang
  };
});

type Props = {
  selected?: string;
  disabled?: boolean;
  onChange: (language: string) => void;
};

const LanguageSelector: FC<Props> = ({ disabled, selected = "text", onChange }) => {
  const [language, setLanguage] = useState(selected);
  useEffect(() => {
    setLanguage(selected);
  }, [selected]);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    onChange(lang);
  };

  return <Select disabled={disabled} options={languageSelectItems} value={language} onChange={changeLanguage} />;
};

export default LanguageSelector;
