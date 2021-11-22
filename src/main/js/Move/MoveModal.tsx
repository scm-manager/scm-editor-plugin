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
import {
  apiClient,
  Button,
  ButtonGroup,
  CommitAuthor,
  ErrorNotification,
  InputField,
  Modal,
  Textarea
} from "@scm-manager/ui-components";
import { useTranslation } from "react-i18next";
import { Changeset, File, Link, Repository } from "@scm-manager/ui-types";
import { useMutation, useQueryClient } from "react-query";
import { useHistory } from "react-router-dom";
import { MoveRequest } from "./moveRequest";
import { createSourceUrlFromChangeset } from "../links";
import { validateNewFilename, validateNewPath } from "./moveDialogValidation";
import { DirectoryValidation, FilenameValidation, PathInputField } from "../PathInputField";

type UseMovePayload = {
  repository: Repository;
  sources: File;
  moveRequest: MoveRequest;
};

const useMoveFolder = () => {
  const queryClient = useQueryClient();
  const history = useHistory();
  const { mutate, data, isLoading, error } = useMutation<Changeset, Error, UseMovePayload>(
    ({ moveRequest, sources }) =>
      apiClient.post((sources._links.move as Link).href, moveRequest).then(response => response.json()),
    {
      onSuccess: async (changeset, { repository, moveRequest: { newPath } }) => {
        await queryClient.invalidateQueries(["repository", repository.namespace, repository.name]);
        const pushPath = createSourceUrlFromChangeset(repository, changeset, newPath.substr(1));
        history.push(pushPath);
      }
    }
  );
  return {
    move: (repository: Repository, parent: File, moveRequest: MoveRequest) => {
      mutate({ repository, moveRequest, sources: parent });
    },
    isLoading,
    error,
    changeset: data
  };
};

type Props = {
  repository: Repository;
  revision?: string;
  sources: File;
  onClose: () => void;
};

const MoveModal: FC<Props> = ({ sources, revision, onClose, repository }) => {
  const originalPath = sources.path === "/" ? "/" : "/" + sources.path;
  let pathToEdit = sources.directory ? originalPath : originalPath.substr(0, originalPath.lastIndexOf("/"));
  if (pathToEdit === "") {
    pathToEdit = "/";
  }
  const filenameToEdit = sources.directory ? undefined : originalPath.substr(originalPath.lastIndexOf("/") + 1);
  const [t] = useTranslation("plugins");
  const [newPath, setNewPath] = useState(pathToEdit);
  const [newFilename, setNewFilename] = useState(filenameToEdit);
  const [commitMessage, setCommitMessage] = useState("");
  const { isLoading, error, move } = useMoveFolder();
  const [newPathValid, setNewPathValid] = useState(true);
  const [newFilenameValid, setNewFilenameValid] = useState(true);

  const updateNewPath = (newPathValue: string, valid: boolean) => {
    setNewPathValid(valid);
    setNewPath(newPathValue);
  };

  const updateNewFilename = (newFilenameValue: string, valid: boolean) => {
    setNewFilenameValid(valid);
    setNewFilename(newFilenameValue);
  };

  const submit = () => {
    let resultingPath = newPath.trim();
    if (!sources.directory) {
      if (!newPath.trim().endsWith("/")) {
        resultingPath = resultingPath + "/";
      }
      resultingPath = resultingPath + newFilename;
    }
    move(repository, sources, {
      commitMessage,
      branch: revision || "",
      newPath: resultingPath
    });
  };

  const filenameInput = !sources.directory && (
    <PathInputField
      label={t("scm-editor-plugin.move.newFilename.label")}
      initialPath={newFilename}
      onChange={updateNewFilename}
      disabled={isLoading}
      errorMessage={t("scm-editor-plugin.validation.filenameInvalid")}
      validation={FilenameValidation}
    />
  );

  const body = (
    <>
      {error ? <ErrorNotification error={error} /> : null}
      {revision ? (
        <InputField label={t("scm-editor-plugin.move.branch.label")} value={revision} disabled={true} />
      ) : null}
      <InputField label={t("scm-editor-plugin.move.path.label")} value={originalPath} disabled={true} />
      <PathInputField
        label={t("scm-editor-plugin.move.newPath.label")}
        initialPath={newPath}
        onChange={updateNewPath}
        disabled={isLoading}
        errorMessage={t("scm-editor-plugin.validation.pathInvalid")}
        validation={DirectoryValidation}
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
      />
    </>
  );

  const commitDisabled = !commitMessage || !newPath || !newPathValid || !newFilenameValid;

  console.log(newFilenameValid)

  const footer = (
    <ButtonGroup>
      <Button className="is-marginless" action={onClose} disabled={isLoading}>
        {t("scm-editor-plugin.move.cancel.label")}
      </Button>
      <Button
        className="is-marginless"
        action={submit}
        disabled={commitDisabled}
        loading={isLoading}
        color="primary"
      >
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
    />
  );
};

export default MoveModal;
