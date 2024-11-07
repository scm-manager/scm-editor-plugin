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
import { Modal } from "@scm-manager/ui-components";
import { Button } from "@scm-manager/ui-core";
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
      commitMessage={commitMessage}
      onChange={setCommitMessage}
      disabled={loading}
      onSubmit={() => !!commitMessage && onCommit(commitMessage)}
      onEnter={() => onCommit(commitMessage)}
      ref={initialFocusRef}
    />
  );

  const footer = (
    <>
      <Button className="is-marginless" onClick={onClose} disabled={loading}>
        {t("scm-editor-plugin.button.cancel")}
      </Button>
      <Button
        className="is-marginless"
        variant="primary"
        disabled={!commitMessage}
        isLoading={loading}
        onClick={() => onCommit(commitMessage)}
        testId={"delete-file-commit-button"}
      >
        {t("scm-editor-plugin.button.commit")}
      </Button>
    </>
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
