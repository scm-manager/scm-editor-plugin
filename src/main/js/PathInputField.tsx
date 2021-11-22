/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
