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
