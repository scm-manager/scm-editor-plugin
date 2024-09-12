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

import React, { FC, ReactPropTypes, useState } from "react";
import { InputField } from "@scm-manager/ui-components";
import { useTranslation } from "react-i18next";
import { sanitizePath } from "./pathSanitizer";

export type Validation = (path: string) => boolean;

type Props = {
  label?: string;
  disabled?: boolean;
  initialPath?: string;
  onChange: (filename: string, valid: boolean) => void;
  validation: Validation;
  testId?: string;
  errorMessage: string;
  placeholder?: string;
  onBlur?: () => void;
};

export const DirectoryValidation: Validation = (path: string) => {
  return path.indexOf("//") < 0;
};

export const FilenameValidation: Validation = (path: string) => {
  return path.indexOf("/") < 0 && path.length > 0;
};

export const PathInputField: FC<Props> = ({ disabled, initialPath, onChange, validation, testId, ...props }) => {
  const [path, setPath] = useState(initialPath);
  const [error, setError] = useState(false);
  const [t] = useTranslation("plugins");

  const pathChanged = (newPath: string) => {
    setPath(newPath);
    const sanitizedPath = sanitizePath(newPath);
    const valid = validation(newPath);
    setError(!valid);
    onChange(sanitizedPath, valid);
  };

  return (
    <InputField
      disabled={disabled}
      value={path}
      validationError={error}
      placeholder={disabled ? "" : t("scm-editor-plugin.path.placeholder.filename")}
      onChange={value => pathChanged(value)}
      testId={testId}
      {...props}
    />
  );
};
