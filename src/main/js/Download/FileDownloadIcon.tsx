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
import { Icon, Tooltip } from "@scm-manager/ui-core";
import { ExtensionPoint } from "@scm-manager/ui-extensions";
import { File, Link, Repository } from "@scm-manager/ui-types";

type Props = {
  repository: Repository;
  file: File;
};

const FileDownloadIcon: FC<Props> = ({ repository, file }) => {
  const [t] = useTranslation("plugins");

  return (
    <ExtensionPoint name="repos.sources.actionbar.download" props={{ repository, file }} renderAll={false}>
      <Tooltip message={t("scm-editor-plugin.download.tooltip")}>
        <a
          className="button is-info is-inverted p-0 m-0"
          href={(file._links.self as Link).href}
          aria-label={t("scm-editor-plugin.download.tooltip")}
          download={file.name}
        >
          <Icon>download</Icon>
        </a>
      </Tooltip>
    </ExtensionPoint>
  );
};

export default FileDownloadIcon;
