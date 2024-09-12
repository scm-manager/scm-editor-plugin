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

import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { File, Link, Repository } from "@scm-manager/ui-types";
import { ExtensionPoint } from "@scm-manager/ui-extensions";
import { Tooltip, Icon } from "@scm-manager/ui-components";

type Props = {
  repository: Repository;
  file: File;
};

const FileDownloadIcon: FC<Props> = ({ repository, file }) => {
  const [t] = useTranslation("plugins");

  return (
    <ExtensionPoint name="repos.sources.actionbar.download" props={{ repository, file }} renderAll={false}>
      <Tooltip message={t("scm-editor-plugin.download.tooltip")} location="top">
        <a
          href={(file._links.self as Link).href}
          aria-label={t("scm-editor-plugin.download.tooltip")}
          download={file.name}
        >
          <Icon name="download" color="inherit" />
        </a>
      </Tooltip>
    </ExtensionPoint>
  );
};

export default FileDownloadIcon;
