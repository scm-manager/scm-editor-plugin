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
import React, { FC, useState } from "react";
import { File, Repository } from "@scm-manager/ui-types";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import MoveModal from "./MoveModal";

const Button = styled.button`
  width: 50px;
  ${props =>
    props.color &&
    `color: ${props.color}; 
    &:hover {
      color: #363636;
    }`};
`;

type Props = {
  repository: Repository;
  revision?: string;
  sources: File;
  color?: string;
};

const MoveButton: FC<Props> = ({ sources, revision, repository, color }) => {
  const [t] = useTranslation("plugins");
  const [modalVisible, setModalVisible] = useState(false);

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
        />
      ) : null}
      <Button
        className="button"
        color={color}
        title={t("scm-editor-plugin.move.tooltip")}
        onClick={() => setModalVisible(true)}
      >
        <i className="fas fa-exchange-alt" />
      </Button>
    </>
  );
};

export default MoveButton;
