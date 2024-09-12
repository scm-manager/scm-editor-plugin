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

import React, { FC, useState } from "react";
import { File, Repository } from "@scm-manager/ui-types";
import { useTranslation } from "react-i18next";
import MoveModal from "./MoveModal";
import { useMoveFolder } from "./moveFolder";
import styled from "styled-components";
import classNames from "classnames";

const StyledButton = styled.button`
  width: 50px;
  &:hover {
    color: #33b2e8;
  }
`;

type Props = {
  repository: Repository;
  revision?: string;
  sources: File;
};

const MoveButton: FC<Props> = ({ sources, revision, repository }) => {
  const [t] = useTranslation("plugins");
  const [modalVisible, setModalVisible] = useState(false);
  const { isLoading, error, move } = useMoveFolder();

  if (!sources || !("move" in sources._links)) {
    return null;
  }

  return (
    <>
      {modalVisible ? (
        <MoveModal
          onClose={() => setModalVisible(false)}
          repository={repository}
          sources={sources}
          revision={revision}
          isLoading={isLoading}
          error={error}
          move={move}
        />
      ) : null}
      <StyledButton
        disabled={isLoading}
        className={classNames("button", { "is-loading": isLoading })}
        title={t("scm-editor-plugin.move.tooltip")}
        onClick={() => setModalVisible(true)}
      >
        <i className="fas fa-exchange-alt" />
      </StyledButton>
    </>
  );
};

export default MoveButton;
