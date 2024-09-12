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

import React, { FC, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonGroup, Modal } from "@scm-manager/ui-components";
import CommitMessage from "../CommitMessage";
import { File } from "@scm-manager/ui-types";

type Props = {
  file: File;
  onCommit: (p: string) => void;
  onClose: () => void;
  loading: boolean;
};

const FileDeleteModal: FC<Props> = ({ onCommit, onClose, loading }) => {
  const [t] = useTranslation("plugins");
  const [commitMessage, setCommitMessage] = useState("");
  const initialFocusRef = useRef<HTMLTextAreaElement>(null);

  const body = (
    <CommitMessage
      onChange={setCommitMessage}
      disabled={loading}
      onSubmit={() => !!commitMessage && onCommit(commitMessage)}
      ref={initialFocusRef}
    />
  );

  const footer = (
    <ButtonGroup>
      <Button
        className="is-marginless"
        label={t("scm-editor-plugin.button.cancel")}
        action={onClose}
        disabled={loading}
      />
      <Button
        className="is-marginless"
        label={t("scm-editor-plugin.button.commit")}
        color="primary"
        disabled={!commitMessage}
        loading={loading}
        action={() => onCommit(commitMessage)}
        testId={"delete-file-commit-button"}
      />
    </ButtonGroup>
  );

  return (
    <Modal
      title={t("scm-editor-plugin.delete.modal.title")}
      closeFunction={() => onClose()}
      body={body}
      footer={footer}
      active={true}
      initialFocusRef={initialFocusRef}
    />
  );
};

export default FileDeleteModal;
