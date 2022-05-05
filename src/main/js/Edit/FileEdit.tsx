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
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Changeset, File, Link, Repository } from "@scm-manager/ui-types";
import { RouteComponentProps, withRouter } from "react-router-dom";
import FileMetaData from "../FileMetaData";
import {
  apiClient,
  Breadcrumb,
  Button,
  ButtonGroup,
  ErrorNotification,
  Level,
  Loading,
  Notification,
  OpenInFullscreenButton,
  Subtitle
} from "@scm-manager/ui-components";
import CommitMessage from "../CommitMessage";
import { isEditable } from "./isEditable";
import { encodeFilePath } from "./encodeFilePath";
import styled from "styled-components";
import { CodeEditor, findLanguage } from "@scm-manager/scm-code-editor-plugin";
import { ExtensionPoint } from "@scm-manager/ui-extensions";
import { setPathInLink } from "../links";

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

type Props = WithTranslation &
  RouteComponentProps & {
    repository: Repository;
    extension: string;
    revision?: string;
    resolvedRevision?: string;
    path?: string;
    file: FileWithType;
    sources: File;
    baseUrl: string;
  };

type State = {
  file?: FileWithType;
  content: string;
  initialRevision?: string;
  path?: string;
  initialError: Error;
  initialLoading: boolean;
  error: Error;
  loading: boolean;
  commitMessage?: string;
  contentType: string;
  language: string;
  contentLength: number;
  isValid?: boolean;
};

class FileEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      initialLoading: true,
      loading: false,
      path: "",
      file: this.isEditMode() ? undefined : {},
      isValid: true,
      initialRevision: props.resolvedRevision
    };
  }

  componentDidMount() {
    if (this.isEditMode()) {
      this.fetchFile();
    } else {
      this.setState({
        initialLoading: false
      });
      this.afterLoading();
    }
  }

  fetchFile = () => {
    this.createFileUrl()
      .then(apiClient.get)
      .then(response => response.json())
      .then((file: FileWithType) =>
        this.setState({
          file
        })
      )
      .then(() => this.fetchContent())
      .catch(this.handleInitialError);
  };

  fetchContent = () => {
    apiClient
      .get((this.state.file?._links.self as Link).href)
      .then(response => {
        response
          .text()
          .then(content =>
            this.setState(
              {
                contentType: response.headers.get("Content-Type"),
                language: response.headers.get("X-Programming-Language"),
                contentLength: content.length,
                content
              },
              this.afterLoading
            )
          )
          .catch(this.handleInitialError);
      })
      .catch(this.handleInitialError);
  };

  afterLoading = () => {
    const pathWithFilename = decodeURIComponent(this.props.path || "");
    const { initialLoading, path } = this.state;
    const lastPathDelimiter = pathWithFilename?.lastIndexOf("/");
    const parentDirPath = this.isEditMode() ? pathWithFilename?.substr(0, lastPathDelimiter) : pathWithFilename;

    if (!path) {
      this.setState({
        path: parentDirPath || ""
      });
    }

    if (initialLoading) {
      this.setState({
        initialLoading: false
      });
    }
  };

  createFileUrl = (): Promise<string> =>
    new Promise((resolve, reject) => {
      const { repository, revision, path, t } = this.props;
      if (repository._links.sources) {
        const base = (repository._links.sources as Link).href;

        if (!path) {
          reject(new Error(t("scm-editor-plugin.errors.fileMissing")));
        }

        if (!revision) {
          reject(new Error(t("scm-editor-plugin.errors.branchMissing")));
        }

        resolve(`${base}${revision}/${path}`);
      }
    });

  isEditMode = () => {
    const { extension, path } = this.props;
    return !!(extension === "edit" && path);
  };

  changePath = (path: string) => {
    this.setState({
      path
    });
  };

  changeFileName = (fileName: string) => {
    this.setState((state: State) => {
      return {
        file: {
          ...state.file,
          name: fileName
        }
      };
    });
  };

  changeFileContent = (content: string) => {
    this.setState({
      content
    });
  };

  changeCommitMessage = (commitMessage: string) => {
    this.setState({
      commitMessage
    });
  };

  handleInitialError = (initialError: Error) => {
    this.setState({
      initialLoading: false,
      initialError
    });
  };

  validate = (isValid: boolean) => {
    this.setState({
      isValid
    });
  };

  handleError = (error: Error) => {
    this.setState({
      loading: false,
      initialLoading: false,
      error
    });
  };

  redirectAfterCommit = (newCommit: Changeset) => {
    const { path, file } = this.state;
    let redirectUrl = this.createRedirectUrl();
    const encodedFilename = file && file.name ? encodeURIComponent(file.name) + "/" : "";

    if (newCommit) {
      const newRevision =
        newCommit._embedded &&
        newCommit._embedded.branches &&
        newCommit._embedded.branches[0] &&
        newCommit._embedded.branches[0].name
          ? newCommit._embedded.branches[0].name
          : newCommit.id;
      let redirectPath = encodeFilePath(path, true) + encodedFilename;
      if (redirectPath[0] === "/") {
        redirectPath = redirectPath.substr(1);
      }
      redirectUrl += `/${encodeURIComponent(newRevision)}/${redirectPath}`;
    }
    this.props.history.push(redirectUrl);
  };

  redirectOnCancel = (revision: string) => {
    const { file } = this.state;
    let redirectUrl = this.createRedirectUrl();

    let path;
    if (this.isEditMode()) {
      path = this.state.path;
    } else {
      path = this.props.path;
    }

    if (revision) {
      redirectUrl += `/${encodeURIComponent(revision)}`;
    }

    redirectUrl += "/" + encodeFilePath(path, true);

    if (this.isEditMode() && file && file.name) {
      redirectUrl += encodeURIComponent(file.name);
    }
    this.props.history.push(redirectUrl);
  };

  createRedirectUrl = () => {
    const { repository } = this.props;
    return `/repo/${repository.namespace}/${repository.name}/code/sources`;
  };

  commitFile = () => {
    const { sources, revision } = this.props;
    const { file, commitMessage, path, content, initialRevision } = this.state;

    if (file) {
      let link;
      let type;
      if (this.isEditMode()) {
        link = (sources._links.modify as Link).href;
        type = file.type;
      } else {
        link = (sources._links.upload as Link).href;
        link = setPathInLink(link, path);
        type = "text/plain";
      }

      const blob = new Blob([content ? content : ""], {
        type
      });
      this.setState({
        loading: true
      });

      const commit = {
        commitMessage,
        branch: decodeURIComponent(revision),
        expectedRevision: initialRevision,
        names: {
          file: file.name
        }
      };

      apiClient
        .postBinary(link, formdata => {
          formdata.append("file", blob, "file");
          formdata.append("commit", JSON.stringify(commit));
        })
        .then((r: Response) => r.json())
        .then((newCommit: Changeset) => this.redirectAfterCommit(newCommit))
        .catch(this.handleError);
    }
  };

  changeLanguage = (language: string) => {
    this.setState({
      language
    });
  };

  render() {
    const { revision, t, repository, baseUrl, resolvedRevision } = this.props;
    const {
      path,
      file,
      content,
      initialLoading,
      initialError,
      loading,
      error,
      isValid,
      commitMessage,
      contentType,
      contentLength,
      initialRevision
    } = this.state;

    if (initialLoading) {
      return <Loading />;
    }

    if (initialError) {
      return <ErrorNotification error={initialError} />;
    }

    const language = findLanguage(this.state.language);
    if (this.isEditMode() && !isEditable(contentType, language, contentLength)) {
      return <Notification type="danger">{t("scm-editor-plugin.edit.notEditable")}</Notification>;
    }

    const extensionsProps = {
      repository: this.props.repository,
      file: this.isEditMode() ? this.props.file : this.state.file,
      revision: this.props.revision,
      path: this.isEditMode() ? this.props.path : this.state.path + "/" + this.state.file?.name
    };

    const body = (
      <>
        <Breadcrumb repository={repository} baseUrl={baseUrl} path={path} revision={revision} clickable={false} />
        <FileMetaData
          changePath={this.changePath}
          path={path}
          file={file}
          changeFileName={this.changeFileName}
          disabled={this.isEditMode() || loading}
          validate={this.validate}
          language={language}
          changeLanguage={this.changeLanguage}
        />
        <CodeEditor onChange={this.changeFileContent} content={content} disabled={loading} language={language} />
      </>
    );

    const revisionChanged = initialRevision && resolvedRevision && initialRevision !== resolvedRevision;
    const revisionChangedWarning = revisionChanged && (
      <Notification type={"warning"}>{t("scm-editor-plugin.edit.revisionChanged")}</Notification>
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
                    modalTitle={file?.name || ""}
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
        <CommitMessage commitMessage={commitMessage} onChange={this.changeCommitMessage} disabled={loading} />
        {error && <ErrorNotification error={error} />}
        <div className="level">
          <div className="level-left" />
          <div className="level-right">
            <ButtonGroup>
              <Button
                label={t("scm-editor-plugin.button.cancel")}
                disabled={loading}
                action={() => this.redirectOnCancel(revision)}
              />
              <Button
                label={t("scm-editor-plugin.button.commit")}
                color={"primary"}
                disabled={!commitMessage || !isValid || !file.name || revisionChanged}
                action={this.commitFile}
                loading={loading}
                testId="create-file-commit-button"
              />
            </ButtonGroup>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(withTranslation("plugins")(FileEdit));
