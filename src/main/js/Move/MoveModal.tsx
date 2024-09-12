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
