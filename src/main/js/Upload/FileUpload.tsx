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

import React, { KeyboardEvent } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { WithTranslation, withTranslation } from "react-i18next";
import { Changeset, File, Link, Repository } from "@scm-manager/ui-types";
import { apiClient, Breadcrumb, Button, ButtonGroup, ErrorNotification, Subtitle } from "@scm-manager/ui-components";
import FileUploadDropzone from "./FileUploadDropzone";
import FileMetaData from "../FileMetaData";
import CommitMessage from "../CommitMessage";
import FileUploadTable from "./FileUploadTable";
import styled from "styled-components";
import { Commit } from "../commit";
import { createSourceUrl, createSourceUrlFromChangeset, setPathInLink } from "../links";
import { ExtensionPoint } from "@scm-manager/ui-extensions";
import FileUploadOptions from "./FileUploadOptions";

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
  .section:focus,
  .section:active {
    box-shadow: none;
  }

  ,
&: focus-within {
    border-color: #33b2e8;
    box-shadow: 0 0 0 0.125em rgba(51, 178, 232, 0.25);

    &:hover {
      border-color: #33b2e8;
    }
  }
  ,
&: hover {
    border: 1px solid #b5b5b5;
    border-radius: 4px;
  }
  ,
  & . input,
  . textarea {
    border-color: #dbdbdb;
  }
`;

type Props = WithTranslation &
  RouteComponentProps & {
    url: string;
    repository: Repository;
    sources: File;
    revision?: string;
    path?: string;
    baseUrl: string;
  };

type State = {
  path: string;
  files: File[];
  commitMessage: string;
  error?: Error;
  loading: boolean;
  shouldValidate: boolean;
  uploadMode: string;
};

class FileUpload extends React.Component<Props, State> {
  cancelButtonRef: React.RefObject<HTMLButtonElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.props,
      loading: false,
      files: [],
      commitMessage: "",
      path: decodeURIComponent(this.props.path ?? ""),
      shouldValidate: true,
      uploadMode: "file"
    };

    this.cancelButtonRef = React.createRef();
  }

  handleError = (error: Error) => {
    this.setState({
      error,
      loading: false
    });
  };

  handleFile = (files: File[]) => {
    this.setState({
      files: [...this.state.files, ...files]
    });
  };

  changeCommitMessage = (commitMessage: string) => {
    this.setState({
      commitMessage
    });
  };

  removeFileEntry = entry => {
    const filteredFiles = this.state.files.filter(file => file !== entry);
    this.setState({
      files: filteredFiles
    });
  };

  commitFile = () => {
    const { sources, history, revision } = this.props;
    const { files, commitMessage, path } = this.state;
    const link = (sources._links.upload as Link).href;

    this.setState({
      loading: true
    });

    const fileAliases: {
      [key: string]: File;
    } = this.buildFileAliases(files);
    const commit: Commit = {
      commitMessage,
      branch: decodeURIComponent(revision),
      names: this.buildFileNameMap(fileAliases)
    };

    apiClient
      .postBinary(setPathInLink(link, path), formdata => {
        Object.keys(fileAliases).forEach(name => formdata.append(name, fileAliases[name], name));
        formdata.append("commit", JSON.stringify(commit));
      })
      .then((r: Response) => r.json())
      .then((newCommit: Changeset) => history.push(this.createSourcesLink(newCommit)))
      .catch(this.handleError);
  };

  buildFileAliases: (
    p: File[]
  ) => {
    [key: string]: File;
  } = files => {
    const fileAliases: {
      [key: string]: File;
    } = {};
    files.forEach((file, i) => (fileAliases["file" + i] = file));
    return fileAliases;
  };

  buildFileNameMap: (p: {
    [key: string]: File;
  }) => {
    [key: string]: string;
  } = fileAliases => {
    const nameMap: {
      [key: string]: string;
    } = {};
    Object.keys(fileAliases).forEach(
      name =>
        (nameMap[name] =
          fileAliases[name].path.substring(0, fileAliases[name].path.length - fileAliases[name].name.length - 1) +
          (fileAliases[name].path.endsWith("/") ? "" : "/") +
          fileAliases[name].name)
    );
    return nameMap;
  };

  createSourcesLink = (changeset?: Changeset) => {
    const { repository, revision } = this.props;
    const { path } = this.state;

    if (changeset) {
      return createSourceUrlFromChangeset(repository, changeset, path);
    }

    return createSourceUrl(repository, revision, path);
  };

  onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      if (this.state.commitMessage !== "") {
        this.commitFile();
      }
    }
  };

  render() {
    const { repository, revision, baseUrl, t } = this.props;
    const { files, path, commitMessage, error, loading, shouldValidate, uploadMode } = this.state;

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")} />
        <Border>
          {revision && (
            <Header className="has-background-secondary-less">
              <span>
                <strong>{t("scm-editor-plugin.edit.selectedBranch") + ": "}</strong>
                {decodeURIComponent(revision)}
              </span>
            </Header>
          )}
          <Breadcrumb repository={repository} baseUrl={baseUrl} path={path} revision={revision} clickable={false} />
          <FileMetaData
            path={path}
            changePath={changedPath => {
              this.setState({
                path: changedPath,
                shouldValidate: false
              });
            }}
            onBlur={() => this.setState({ shouldValidate: true })}
            disabled={loading}
          />
          <FileUploadDropzone fileHandler={this.handleFile} disabled={loading} uploadMode={uploadMode} />
        </Border>
        <FileUploadOptions
          uploadMode={uploadMode}
          setUploadMode={(uploadMode: string) => this.setState({ ...this.state, uploadMode })}
        />
        <br />
        {files && files.length > 0 && (
          <FileUploadTable files={files} removeFileEntry={this.removeFileEntry} disabled={loading} />
        )}
        <ExtensionPoint
          name="editorPlugin.file.upload.validation"
          props={{ repository, files, path, shouldValidate }}
        />
        {error && <ErrorNotification error={error} />}
        <CommitMessage
          commitMessage={commitMessage}
          onChange={this.changeCommitMessage}
          disabled={loading}
          onEnter={() => this.commitFile()}
          cancelButtonRef={this.cancelButtonRef}
        />
        <br />
        <div className="level">
          <div className="level-left" />
          <div className="level-right">
            <ButtonGroup>
              <Button
                label={t("scm-editor-plugin.button.cancel")}
                link={this.createSourcesLink()}
                disabled={loading}
                ref={this.cancelButtonRef}
              />
              <Button
                label={t("scm-editor-plugin.button.commit")}
                color={"primary"}
                disabled={!commitMessage || files.length === 0}
                action={this.commitFile}
                loading={loading}
                testId="upload-file-commit-button"
              />
            </ButtonGroup>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(withTranslation("plugins")(FileUpload));
