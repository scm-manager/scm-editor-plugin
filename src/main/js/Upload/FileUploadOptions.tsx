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

import React, { FC, SetStateAction } from "react";
import { Radio } from "@scm-manager/ui-core";
import { useTranslation } from "react-i18next";
import { binder } from "@scm-manager/ui-extensions";

type props = {
  uploadMode: string;
  setUploadMode: SetStateAction<any>;
};

const FileUploadOptions: FC<props> = ({ uploadMode, setUploadMode }) => {
  const [t] = useTranslation("plugins");
  const extension = binder.getExtension("editorPlugin.upload");

  if (!extension) {
    return null;
  }

  return (
    <div>
      <Radio checked={uploadMode === "file"} onChange={() => setUploadMode("file")} />
      {t("scm-editor-plugin.upload.fileUpload")}
      {extension().renderOption(uploadMode, setUploadMode, t)}
    </div>
  );
};
export default FileUploadOptions;
