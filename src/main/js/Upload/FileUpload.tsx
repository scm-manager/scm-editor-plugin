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
import { createSourceUrl, createSourceUrlFromChangeset } from "../links";
import { ExtensionPoint } from "@scm-manager/ui-extensions";

const Header = styled.div`
  background-color: #f5f5f5;
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
  &:focus-within {
    border-color: #33b2e8;
    box-shadow: 0 0 0 0.125em rgba(51, 178, 232, 0.25);
    &:hover {
      border-color: #33b2e8;
    }
  }
  ,
  &:hover {
    border: 1px solid #b5b5b5;
    border-radius: 4px;
  }
  ,
  & .input,
  .textarea {
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
  commitMessage: any;
  error: Error;
  loading: boolean;
  valid: boolean;
};

class FileUpload extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.props,
      loading: false,
      files: [],
      commitMessage: "",
      valid: true
    };
  }

  handleError = (error: Error) => {
    this.setState({
      error,
      loading: false
    });
  };

  handleFile = files => {
    const fileArray = this.state.files ? this.state.files : [];
    files.forEach(file => fileArray.push(file));
    this.setState({
      files: fileArray
    });
  };

  changePath = (path: string) => {
    this.setState({
      path
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
      .postBinary(link.replace("{path}", path ? path : ""), formdata => {
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
    Object.keys(fileAliases).forEach(name => (nameMap[name] = fileAliases[name].name));
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

  render() {
    const { repository, revision, baseUrl, t } = this.props;
    const { files, path, commitMessage, error, loading, valid } = this.state;

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")} />
        <Border>
          {revision && (
            <Header>
              <span>
                <strong>{t("scm-editor-plugin.edit.selectedBranch") + ": "}</strong>
                {decodeURIComponent(revision)}
              </span>
            </Header>
          )}
          <Breadcrumb repository={repository} baseUrl={baseUrl} path={path} revision={revision} />
          <FileMetaData path={path} changePath={this.changePath} />
          <FileUploadDropzone fileHandler={this.handleFile} disabled={loading} />
        </Border>
        {files && files.length > 0 && (
          <FileUploadTable files={files} removeFileEntry={this.removeFileEntry} disabled={loading} />
        )}
        <ExtensionPoint
          name="editorPlugin.file.upload.validation"
          props={{ repository, files, isValid: (disable: boolean) => this.setState({ valid: disable }) }}
        />
        {error && <ErrorNotification error={error} />}
        <CommitMessage commitMessage={commitMessage} onChange={this.changeCommitMessage} disabled={loading} />
        <br />
        <div className="level">
          <div className="level-left" />
          <div className="level-right">
            <ButtonGroup>
              <Button label={t("scm-editor-plugin.button.cancel")} link={this.createSourcesLink()} disabled={loading} />
              <Button
                label={t("scm-editor-plugin.button.commit")}
                color={"primary"}
                disabled={!commitMessage || files.length === 0 || !valid}
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
