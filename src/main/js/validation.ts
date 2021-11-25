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

import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useFilenameValidation = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [t] = useTranslation("plugins");

  const validate = (filename: string) => {
    const sanitizedFilename = filename.replace(/\\/g, "/").trim();

    if (sanitizedFilename.length === 0) {
      setErrorMessage(t("scm-editor-plugin.validation.filenameEmpty"));
      return;
    }

    if (sanitizedFilename.includes("/")) {
      setErrorMessage(t("scm-editor-plugin.validation.filenameInvalid"));
      return;
    }

    setErrorMessage(undefined);
  };

  return [validate, errorMessage] as const;
};

export const useDirectoryValidation = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [t] = useTranslation("plugins");

  const validate = (directory: string, allowRoot = true) => {
    const sanitizedDirectory = directory.replace(/\\/g, "/").trim();

    if (!allowRoot && (sanitizedDirectory.length === 0 || sanitizedDirectory === "/")) {
      setErrorMessage(t("scm-editor-plugin.validation.directoryEmpty"));
      return;
    }

    if (sanitizedDirectory.includes("//") || sanitizedDirectory.includes("..")) {
      setErrorMessage(t("scm-editor-plugin.validation.directoryInvalid"));
      return;
    }

    setErrorMessage(undefined);
  };

  return [validate, errorMessage] as const;
};
