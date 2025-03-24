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

import { useTranslation } from "react-i18next";
import { Button, ButtonVariants, ErrorNotification, LinkButton, Subtitle, useShortcut } from "@scm-manager/ui-core";
import React, { useRef, useState } from "react";
import styled from "styled-components";
import FileMetaData from "../FileMetaData";
import { Repository, File as SCMFile } from "@scm-manager/ui-types";
import FileUploadDropzone from "./FileUploadDropzone";
import FileUploadOptions from "./FileUploadOptions";
import FileUploadTable from "./FileUploadTable";
import { createSourcesLink, removeFileEntry, useFileCommit } from "./fileUpload";
import { ExtensionPoint } from "@scm-manager/ui-extensions";
import CommitMessage from "../CommitMessage";
import { Breadcrumb } from "@scm-manager/ui-components";
import FileActionBorder from "../FileActionBorder";
import { useHistory } from "react-router-dom";

const Header = styled.div`
  line-height: 1.25;
  padding: 1em;
  border-bottom: solid 1px #dbdbdb;
`;

type Props = {
  url: string;
  repository: Repository;
  sources: SCMFile;
  revision: string;
  baseUrl: string;
  path?: string;
};

function FileUpload({ repository, path, sources, revision, baseUrl }: Readonly<Props>) {
  const [t] = useTranslation("plugins");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<string>("file");
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<string>(decodeURIComponent(path ?? ""));
  const [shouldValidate, setShouldValidate] = useState<boolean>(true);
  const history = useHistory();
  const { loading, error, fileCommit } = useFileCommit();

  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const commitMessageAreaRef = useRef<HTMLTextAreaElement>(null);

  const cancelButtonLink = createSourcesLink(decodeURIComponent(path ?? ""), repository, revision);
  const cancelButton = (
    <LinkButton
      to={cancelButtonLink}
      onKeyDown={(key) => {
        // We need to hard-code this behavior here because useShortcut() in FileUploadDropzone overrides it.
        if (key.key === " " || key.key === "Enter") {
          history.push(cancelButtonLink);
        }
      }}
      // @ts-ignore - cancelButtonRef still works for our purposes here
      ref={cancelButtonRef}
    >
      {t("scm-editor-plugin.button.cancel")}
    </LinkButton>
  );

  const commitMessageArea = (
    <CommitMessage
      commitMessage={commitMessage}
      id="commitMessageField"
      ref={commitMessageAreaRef}
      cancelButtonRef={cancelButtonRef}
      onChange={(msg) => setCommitMessage(msg)}
      disabled={loading}
      onEnter={() => fileCommit(currentPath, files, sources, revision, repository, commitMessage)}
    />
  );

  let header = null;
  if (revision) {
    header = (
      <Header className={"has-background-secondary-less"}>
        <span>
          <strong>{t("scm-editor-plugin.edit.selectedBranch", { branch: decodeURIComponent(revision) })}</strong>
        </span>
      </Header>
    );
  }

  let fileTable = null;
  if (files && files.length > 0) {
    fileTable = (
      <FileUploadTable
        // @ts-ignore - It is not a clean approach, but did work with the status quo. Please check in case of issues.
        files={files}
        removeFileEntry={(entry) => {
          // @ts-ignore - See above
          setFiles(removeFileEntry(entry, files));
        }}
        disabled={loading}
      />
    );
  }

  useShortcut(
    "ctrl+enter",
    () => {
      if (document.activeElement?.id !== "commitMessageField") {
        // @ts-ignore
        commitMessageAreaRef.current?.focus();
      } else if (document.activeElement?.id === "commitMessageField" && commitMessage !== "" && files) {
        fileCommit(currentPath, files, sources, revision, repository, commitMessage);
      }
    },
    {
      description: t("scm-editor-plugin.shortcuts.strgEnter"),
    },
  );
  useShortcut(
    "esc",
    () => {
      // We explicitly expect the CommitMessage component to handle this logic (no 'esc' specified outside the text area).
      // However, '?' doesn't work as a shortcut in text input, so this is used as a workaround to be shown in description.
    },
    {
      description: t("scm-editor-plugin.shortcuts.escape"),
      active: document.activeElement?.id === "commitMessageField",
    },
  );

  const isFormValid = () => commitMessage && files.length > 0;

  return (
    <>
      <Subtitle subtitle={t("scm-editor-plugin.upload.title")} />
      <FileActionBorder>
        {header}
        <Breadcrumb
          repository={repository}
          baseUrl={baseUrl}
          path={path ?? ""}
          revision={revision}
          clickable={false}
          permalink={"/" + path}
          // @ts-ignore - sources are not relevant in this case and don't need to be shown here.
          sources={null}
        />
        <FileMetaData
          path={currentPath}
          changePath={(changedPath) => {
            setCurrentPath(decodeURIComponent(changedPath));
            setShouldValidate(false);
          }}
          disabled={loading}
          onBlur={() => {
            setShouldValidate(true);
          }}
        ></FileMetaData>
        <FileUploadDropzone
          fileHandler={(newFiles: File[]) => {
            setFiles([...newFiles, ...files]);
          }}
          disabled={loading}
          uploadMode={uploadMode}
        />
        <FileUploadOptions
          uploadMode={uploadMode}
          setUploadMode={(uploadMode: string) => setUploadMode(uploadMode)}
        ></FileUploadOptions>
      </FileActionBorder>
      {fileTable}
      <br />
      <ExtensionPoint
        name="editorPlugin.file.upload.validation"
        props={{ repository, files, currentPath, shouldValidate }}
      />
      {error ? <ErrorNotification error={error} /> : null}
      {commitMessageArea}
      <br />
      <div className="level">
        <div className="level-left" />
        <div className="level-right buttons">
          {cancelButton}
          <Button
            variant={ButtonVariants.PRIMARY}
            disabled={!isFormValid()}
            onClick={() => fileCommit(currentPath, files, sources, revision, repository, commitMessage)}
            onKeyDown={(key) => {
              // We need to hard-code this behavior here because useShortcut() in FileUploadDropzone overrides it.
              if ((key.key === " " || key.key === "Enter") && isFormValid()) {
                fileCommit(currentPath, files, sources, revision, repository, commitMessage);
              }
            }}
            isLoading={loading}
            testId="upload-file-commit-button"
          >
            {t("scm-editor-plugin.button.commit")}
          </Button>
        </div>
      </div>
    </>
  );
}

export default FileUpload;
