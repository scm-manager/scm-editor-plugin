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
import {
  Button,
  ButtonGroup,
  CommitAuthor,
  ErrorNotification,
  InputField,
  Modal,
  Textarea
} from "@scm-manager/ui-components";
import { useTranslation } from "react-i18next";
import { File, Repository } from "@scm-manager/ui-types";
import { MoveRequest } from "./moveRequest";
import { useDirectoryValidation, useFilenameValidation } from "../validation";
import { usePathState } from "../pathSanitizer";

type Props = {
  repository: Repository;
  revision?: string;
  sources: File;
  onClose: () => void;
  move: (repository: Repository, parent: File, moveRequest: MoveRequest) => void;
  isLoading: boolean;
  error: Error | null;
};

const MoveModal: FC<Props> = ({ sources, revision, onClose, repository, move, isLoading, error }) => {
  const originalPath = sources.path === "/" ? "/" : "/" + sources.path;
  let pathToEdit = sources.directory ? originalPath : originalPath.substr(0, originalPath.lastIndexOf("/"));
  if (pathToEdit === "") {
    pathToEdit = "/";
  }
  const filenameToEdit = sources.directory ? undefined : originalPath.substr(originalPath.lastIndexOf("/") + 1);
  const [t] = useTranslation("plugins");
  const [newPath, setNewPath, sanitizedPath] = usePathState(pathToEdit);
  const [newFilename, setNewFilename] = usePathState(filenameToEdit);
  const [commitMessage, setCommitMessage] = useState("");
  const [validateFilename, filenameErrorMessage] = useFilenameValidation();
  const [validateDirectory, directoryErrorMessage] = useDirectoryValidation();
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const updateNewPath = (newPathValue: string) => {
    validateDirectory(newPathValue, !sources.directory);
    setNewPath(newPathValue);
  };

  const updateNewFilename = (newFilenameValue: string) => {
    validateFilename(newFilenameValue);
    setNewFilename(newFilenameValue);
  };

  const commitDisabled = !commitMessage || !!directoryErrorMessage || !!filenameErrorMessage;

  const submit = () => {
    if (commitDisabled) {
      return;
    }

    let resultingPath = sanitizedPath;
    if (!sources.directory) {
      if (resultingPath.length !== 0 && !resultingPath.endsWith("/")) {
        resultingPath = resultingPath + "/";
      }
      resultingPath = resultingPath + newFilename;
    }
    move(repository, sources, {
      commitMessage,
      branch: decodeURIComponent(revision ?? ""),
      newPath: "/" + resultingPath
    });
  };

  const filenameInput = !sources.directory && (
    <InputField
      label={t("scm-editor-plugin.move.newFilename.label")}
      value={newFilename}
      onChange={updateNewFilename}
      disabled={isLoading}
      validationError={!!filenameErrorMessage}
      errorMessage={filenameErrorMessage}
      onReturnPressed={submit}
    />
  );

  const body = (
    <>
      {error ? <ErrorNotification error={error} /> : null}
      {revision ? (
        <InputField
          label={t("scm-editor-plugin.move.branch.label")}
          value={decodeURIComponent(revision)}
          disabled={true}
        />
      ) : null}
      <InputField label={t("scm-editor-plugin.move.path.label")} value={originalPath} disabled={true} />
      <InputField
        label={t("scm-editor-plugin.move.newPath.label")}
        value={newPath}
        onChange={event => updateNewPath(event.target.value)}
        disabled={isLoading}
        validationError={!!directoryErrorMessage}
        errorMessage={directoryErrorMessage}
        onReturnPressed={submit}
        ref={initialFocusRef}
      />
      {filenameInput}
      <div className="mb-2 mt-5">
        <CommitAuthor />
      </div>
      <Textarea
        placeholder={t("scm-editor-plugin.move.commit.placeholder")}
        onChange={message => setCommitMessage(message)}
        value={commitMessage}
        disabled={isLoading}
        onSubmit={submit}
      />
    </>
  );

  const footer = (
    <ButtonGroup>
      <Button className="is-marginless" action={onClose} disabled={isLoading}>
        {t("scm-editor-plugin.move.cancel.label")}
      </Button>
      <Button className="is-marginless" action={submit} disabled={commitDisabled} loading={isLoading} color="primary">
        {t("scm-editor-plugin.move.submit.label")}
      </Button>
    </ButtonGroup>
  );

  return (
    <Modal
      body={body}
      footer={footer}
      title={sources.directory ? t("scm-editor-plugin.move.directory.title") : t("scm-editor-plugin.move.file.title")}
      closeFunction={onClose}
      active={true}
      initialFocusRef={initialFocusRef}
    />
  );
};

export default MoveModal;
