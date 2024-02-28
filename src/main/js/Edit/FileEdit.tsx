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
import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Changeset, File, Link, Repository } from "@scm-manager/ui-types";
import FileMetaData from "../FileMetaData";
import {
  apiClient,
  Breadcrumb,
  ErrorNotification,
  Level,
  Loading,
  Notification,
  OpenInFullscreenButton,
  Subtitle
} from "@scm-manager/ui-components";
import CommitMessage from "../CommitMessage";
import { isEditable } from "./isEditable";
import { Button, useShortcut } from "@scm-manager/ui-core";
import { encodeFilePath } from "./encodeFilePath";
import styled from "styled-components";
import { CodeEditor, findLanguage } from "@scm-manager/scm-code-editor-plugin";
import { ExtensionPoint } from "@scm-manager/ui-extensions";
import { setPathInLink } from "../links";
import { useHistory } from "react-router-dom";
import { encodeInvalidCharacters } from "./encodeInvalidCharacters";

const Header = styled.div`
  line-height: 1.25;
  padding: 1em;
  border-bottom: solid 1px #dbdbdb;
`;

const Border = styled.div`
  margin-bottom: 2rem;
  border: 1px solid #98d8f3;
  border-radius: 4px;
  & .input:focus,
  .input:active,
  .textarea:focus,
  .textarea:active {
    box-shadow: none;
  }
  ,
&:focus-within: {
    border-color: #33b2e8;
    box-shadow: 0 0 0 0.125em rgba(51, 178, 232, 0.25);
    &:hover {
      border-color: #33b2e8;
    }
  }
  ,
&:hover: {
    border: 1px solid #b5b5b5;
    border-radius: 4px;
  }
  ,
& .input, .textarea: {
    border-color: #dbdbdb;
  }
`;

const MarginlessModalContent = styled.div`
  margin: -1.25rem;

  .ace_editor {
    min-height: 80px;
    height: calc(97vh - 23rem) !important;
  }
`;

type FileWithType = File & {
  type?: string;
};

type Props = {
  repository: Repository;
  extension: string;
  revision?: string;
  resolvedRevision?: string;
  path?: string;
  file: FileWithType;
  sources: File;
  baseUrl: string;
};

const FileEdit: FC<Props> = ({ repository, extension, revision, resolvedRevision, path, file, sources, baseUrl }) => {
  const [t] = useTranslation("plugins");
  const [content, setContent] = useState<string>("");
  const [statePath, setStatePath] = useState<string | undefined>("");
  const [initialError, setInitialError] = useState<Error>();
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [language, setLanguage] = useState<string>("text");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [fetchData, setFetchData] = useState<boolean>(false);
  const history = useHistory();

  const commitButtonRef = useRef<HTMLButtonElement>();
  const cancelButtonRef = useRef<HTMLButtonElement>();
  const editorRef = useRef();
  const commitMessageRef = useRef<HTMLTextAreaElement>();

  const isEditMode = () => {
    return !!(extension === "edit" && path);
  };
  const [stateFile, setFile] = useState<FileWithType | undefined>(isEditMode() ? undefined : { name: "" });

  useEffect(() => {
    if (isEditMode()) {
      fetchFile();
    } else {
      setInitialLoading(false);
      afterLoading();
    }
  }, []);

  useEffect(() => {
    if (stateFile !== undefined && fetchData) {
      fetchContent();
    }
  }, [fetchData]);

  const evaluateCtrlEnterShortcut = () => {
    if (commitMessageRef.current === document.activeElement) {
      commitButtonRef.current?.click();
    } else {
      commitMessageRef.current?.focus();
    }
  };

  const evaluateEscShortcut = () => {
    if (commitMessageRef.current === document.activeElement) {
      cancelButtonRef.current?.focus();
    }
  };

  const evaluateEscShortCutEditor = () => {
    cancelButtonRef.current?.focus();
  };

  const onBlurCallbacks = {
    esc: evaluateEscShortCutEditor,
    strgEnter: evaluateCtrlEnterShortcut
  };

  useShortcut("ctrl+enter", evaluateCtrlEnterShortcut, {
    description: t("scm-editor-plugin.shortcuts.strgEnter")
  });

  useShortcut("esc", evaluateEscShortcut, {
    description: t("scm-editor-plugin.shortcuts.escape")
  });

  const fetchFile = () => {
    createFileUrl()
      .then(apiClient.get)
      .then(response => response.json())
      .then((file: FileWithType) => {
        setFile(file);
        setFetchData(true);
      })
      .catch(handleInitialError);
  };

  const fetchContent = () => {
    apiClient
      .get((stateFile?._links?.self as Link).href)
      .then(response => {
        response
          .text()
          .then(content => {
            setLanguage(findLanguage(response.headers.get("X-Programming-Language") ?? ""));
            setContent(content);
            afterLoading();
          })
          .catch(handleInitialError);
      })
      .catch(handleInitialError);
  };

  const handleInitialError = (initialError: Error) => {
    setInitialLoading(false);
    setInitialError(initialError);
  };

  const createFileUrl = (): Promise<string> =>
    new Promise((resolve, reject) => {
      if (repository._links.sources) {
        const base = (repository._links.sources as Link).href;

        if (!path) {
          reject(new Error(t("scm-editor-plugin.errors.fileMissing")));
        }

        if (!revision) {
          reject(new Error(t("scm-editor-plugin.errors.branchMissing")));
        }
        resolve(`${base}${revision}/${encodeInvalidCharacters(path!)}`);
      }
    });

  const afterLoading = () => {
    const pathWithFilename = decodeURIComponent(path || "");
    const lastPathDelimiter = pathWithFilename?.lastIndexOf("/");
    const parentDirPath = isEditMode() ? pathWithFilename?.substr(0, lastPathDelimiter) : pathWithFilename;

    if (!statePath) {
      setStatePath(parentDirPath || "");
    }

    if (initialLoading) {
      setInitialLoading(false);
    }
  };

  const changeFileName = (fileName: string) => {
    setFile({ ...stateFile, name: fileName });
  };

  const handleError = (error: Error) => {
    setLoading(false);
    setInitialLoading(false);
    setError(error);
  };

  const redirectAfterCommit = (newCommit: Changeset) => {
    let redirectUrl = createRedirectUrl();
    const encodedFilename = stateFile?.name ? encodeURIComponent(stateFile.name) + "/" : "";

    if (newCommit) {
      const newRevision = newCommit._embedded?.branches?.[0]?.name
        ? newCommit._embedded.branches[0].name
        : newCommit.id;
      let redirectPath = encodeFilePath(statePath, true) + encodedFilename;
      if (redirectPath.startsWith("/")) {
        redirectPath = redirectPath.substring(1);
      }
      redirectUrl += `/${encodeURIComponent(newRevision)}/${redirectPath}`;
    }
    history.push(redirectUrl);
  };

  const redirectOnCancel = (revision: string) => {
    let redirectUrl = createRedirectUrl();

    let _path;
    if (isEditMode()) {
      _path = statePath;
    } else {
      _path = path;
    }

    if (revision) {
      redirectUrl += `/${encodeURIComponent(revision)}`;
    }

    redirectUrl += "/" + encodeFilePath(_path, true);

    if (isEditMode() && stateFile && stateFile.name) {
      redirectUrl += encodeURIComponent(stateFile.name);
    }
    history.push(redirectUrl);
  };

  const createRedirectUrl = () => {
    return `/repo/${repository.namespace}/${repository.name}/code/sources`;
  };

  const commitFile = () => {
    if (stateFile) {
      let link;
      let type;
      if (isEditMode()) {
        link = (sources._links.modify as Link).href;
        type = stateFile.type;
      } else {
        link = (sources._links.upload as Link).href;
        link = setPathInLink(link, statePath);
        type = "text/plain";
      }

      const blob = new Blob([content || ""], {
        type
      });
      setLoading(true);

      const commit = {
        commitMessage,
        branch: decodeURIComponent(revision ?? ""),
        expectedRevision: file?.revision ?? "",
        names: {
          file: stateFile.name
        }
      };

      apiClient
        .postBinary(link, formdata => {
          formdata.append("file", blob, "file");
          formdata.append("commit", JSON.stringify(commit));
        })
        .then((r: Response) => r.json())
        .then(redirectAfterCommit)
        .catch(handleError);
    }
  };

  if (initialLoading) {
    return <Loading />;
  }

  const revisionChanged = !!(file?.revision && resolvedRevision && file?.revision !== resolvedRevision);
  const revisionChangedWarning = revisionChanged && (
    <Notification type="warning">{t("scm-editor-plugin.edit.revisionChanged")}</Notification>
  );

  if (initialError) {
    return <ErrorNotification error={initialError} />;
  }

  if (isEditMode() && !isEditable(file?.type, language)) {
    return <Notification type="danger">{t("scm-editor-plugin.edit.notEditable")}</Notification>;
  }

  const extensionsProps = {
    repository: repository,
    file: isEditMode() ? file : stateFile,
    revision: revision,
    path: isEditMode() ? path : statePath + "/" + stateFile?.name
  };

  const body = (
    <>
      <Breadcrumb
        repository={repository}
        baseUrl={baseUrl}
        path={encodeURIComponent(statePath)}
        revision={revision}
        clickable={false}
      />
      <FileMetaData
        changePath={setStatePath}
        path={statePath}
        file={stateFile}
        changeFileName={changeFileName}
        disabled={isEditMode() || loading}
        validate={setIsValid}
        language={language}
        changeLanguage={lng => setLanguage(findLanguage(lng))}
        autoFocus={extension === "create"}
      />
      <CodeEditor
        onChange={setContent}
        content={content}
        disabled={loading}
        language={language}
        initialFocus={extension === "edit"}
        ref={editorRef}
        onBlur={onBlurCallbacks}
      />
    </>
  );

  return (
    <>
      <Subtitle subtitle={t("scm-editor-plugin.edit.subtitle")} />
      <Border>
        {revision && (
          <Header className="has-background-secondary-less">
            <Level
              left={
                <span>
                  <strong>{t("scm-editor-plugin.edit.selectedBranch") + ": "}</strong>
                  {decodeURIComponent(revision)}
                </span>
              }
              right={
                <OpenInFullscreenButton
                  modalTitle={stateFile?.name || ""}
                  modalBody={<MarginlessModalContent>{body}</MarginlessModalContent>}
                  tooltipStyle="htmlTitle"
                />
              }
            />
          </Header>
        )}
        {body}
      </Border>
      <ExtensionPoint name="editor.file.hints" renderAll={true} props={extensionsProps} />
      {revisionChangedWarning}
      <CommitMessage
        commitMessage={commitMessage}
        onChange={setCommitMessage}
        disabled={loading}
        ref={commitMessageRef}
      />
      {error && <ErrorNotification error={error} />}
      <div className="level">
        <div className="level-left" />
        <div className="level-right">
          <Button
            disabled={loading}
            className="mr-3"
            onClick={() => redirectOnCancel(revision)}
            ref={cancelButtonRef}
            variant="secondary"
          >
            {t("scm-editor-plugin.button.cancel")}
          </Button>
          <Button
            disabled={!commitMessage || !isValid || !stateFile.name || revisionChanged}
            onClick={commitFile}
            loading={loading}
            testId="create-file-commit-button"
            ref={commitButtonRef}
            variant="primary"
          >
            {t("scm-editor-plugin.button.commit")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default FileEdit;
