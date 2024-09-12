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
import { Link } from "react-router-dom";
import styled from "styled-components";
import { File, Repository } from "@scm-manager/ui-types";
import { createAttributesForTesting, Icon } from "@scm-manager/ui-components";
import { createSourceExtensionUrl } from "../links";

type Props = {
  repository: Repository;
  revision?: string;
  path?: string;
  sources: File;
};

const ButtonLink = styled(Link)`
  width: 50px;
  &:hover {
    color: #33b2e8;
  }
`;

const FileCreateButton: FC<Props> = ({ repository, revision, path, sources }) => {
  const [t] = useTranslation("plugins");
  return (
    <>
      {sources && sources._links.upload && (
        <ButtonLink
          to={createSourceExtensionUrl(repository, "create", revision, path)}
          className="button"
          title={t("scm-editor-plugin.create.tooltip")}
          {...createAttributesForTesting("create-file-button")}
        >
          <Icon name="file-medical" color="inherit" />
        </ButtonLink>
      )}
    </>
  );
};

export default FileCreateButton;
