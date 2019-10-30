import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { WithTranslation, withTranslation } from "react-i18next";
import { File, Me, Repository, Link, Changeset } from "@scm-manager/ui-types";
import { apiClient, Button, ButtonGroup, ErrorNotification, Subtitle } from "@scm-manager/ui-components";
import FileUploadDropzone from "./FileUploadDropzone";
import FilePath from "../FileMetaData";
import CommitMessage from "../CommitMessage";
import FileUploadTable from "./FileUploadTable";
import styled from "styled-components";
import { Commit } from "../commit";
import {createSourceUrl, createSourceUrlFromChangeset} from "../links";

const BranchMarginBottom = styled.div`
  margin-bottom: 1rem;
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
    me?: Me;
    url: string;
    repository: Repository;
    sources: File;
    revision?: string;
    path?: string;
  };

type State = {
  path: string;
  files: File[];
  commitMessage: any;
  error: Error;
  loading: boolean;
};

class FileUpload extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.props,
      loading: false,
      files: [],
      commitMessage: ""
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
    const { sources, history } = this.props;
    const { files, commitMessage, path, branch } = this.state;
    const link = (sources._links.fileUpload as Link).href;

    this.setState({
      loading: true
    });

    const fileAliases: {
      [key: string]: File;
    } = this.buildFileAliases(files);
    const commit: Commit = {
      commitMessage,
      branch,
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
    const { revision, me, t } = this.props;
    const { files, path, commitMessage, error, loading } = this.state;

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")} />
        {revision && (
          <BranchMarginBottom>
            <span>
              <strong>{t("scm-editor-plugin.edit.selectedBranch") + ": "}</strong>
              {revision}
            </span>
          </BranchMarginBottom>
        )}
        <Border>
          <FilePath path={path} changePath={this.changePath} />
          <FileUploadDropzone fileHandler={this.handleFile} disabled={loading} />
        </Border>
        {files && files.length > 0 && (
          <FileUploadTable files={files} removeFileEntry={this.removeFileEntry} disabled={loading} />
        )}
        {error && <ErrorNotification error={error} />}
        <CommitMessage me={me} commitMessage={commitMessage} onChange={this.changeCommitMessage} disabled={loading} />
        <br />
        <div className="level">
          <div className="level-left" />
          <div className="level-right">
            <ButtonGroup>
              <Button label={t("scm-editor-plugin.button.cancel")} link={this.createSourcesLink()} disabled={loading} />
              <Button
                label={t("scm-editor-plugin.button.commit")}
                color={"primary"}
                disabled={!commitMessage || files.length === 0}
                action={this.commitFile}
                loading={loading}
              />
            </ButtonGroup>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: any) => {
  const { auth } = state;
  const me = auth.me;

  return {
    me
  };
};

export default compose(
  withTranslation("plugins"),
  withRouter,
  connect(mapStateToProps)
)(FileUpload);
