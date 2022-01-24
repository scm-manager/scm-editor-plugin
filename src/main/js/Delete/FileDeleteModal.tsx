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
