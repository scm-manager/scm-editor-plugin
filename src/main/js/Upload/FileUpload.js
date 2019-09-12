// @flow
import React from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import injectSheet from "react-jss";
import {withRouter} from "react-router-dom";
import {translate} from "react-i18next";
import queryString from "query-string";
import type {File, Me, Repository} from "@scm-manager/ui-types";
import {apiClient, Button, ButtonGroup, ErrorNotification, InputField, Subtitle} from "@scm-manager/ui-components";
import FileUploadDropzone from "./FileUploadDropzone";
import FilePath from "../FilePath";
import CommitMessage from "../CommitMessage";
import FileUploadTable from "./FileUploadTable";
import classNames from "classnames";

const styles = {
  branch: {
    "& input": {
      marginBottom: "2rem"
    }
  },
  border: {
    marginBottom: "2rem",
    border: "1px solid #98d8f3",
    borderRadius: "4px",
    "& .input:focus, .input:active, .section:focus, .section:active": {
      boxShadow: "none"
    },
    "&:focus-within": {
      borderColor: "#33b2e8",
      boxShadow: "0 0 0 0.125em rgba(51, 178, 232, 0.25)",
      "&:hover": {
        borderColor: "#33b2e8"
      }
    },
    "&:hover": {
      border: "1px solid #b5b5b5",
      borderRadius: "4px"
    },
    "& .input, .textarea": {
      borderColor: "#dbdbdb"
    }
  }
};

type Props = {
  me?: Me,
  url: string,
  repository: Repository,

  //context props
  t: string => string,
  match: any,
  location: any,
  history: any,
  classes: any
};

type State = {
  path: string,
  files: File[],
  commitMessage: any,
  branch: string,
  revision: string,
  error: Error,
  loading: boolean
};

class FileUpload extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.state,
      loading: false,
      files: [],
      path: this.props.match.params.path ? this.props.match.params.path : "",
      commitMessage: "",
      branch: queryString.parse(this.props.location.search, {
        ignoreQueryPrefix: true
      }).branch,
      revision: queryString.parse(this.props.location.search, {
        ignoreQueryPrefix: true
      }).revision
    };
  }

  handleError = (error: Error) => {
    this.setState({ error, loading: false });
  };

  handleFile = files => {
    const fileArray = this.state.files ? this.state.files : [];
    files.forEach(file => fileArray.push(file));
    this.setState({ files: fileArray });
  };

  changePath = path => {
    this.setState({ path });
  };

  changeCommitMessage = commitMessage => {
    this.setState({ commitMessage });
  };

  removeFileEntry = entry => {
    const filteredFiles = this.state.files.filter(file => file !== entry);
    this.setState({ files: filteredFiles });
  };

  commitFile = sourcesLink => {
    const { repository, history } = this.props;
    const { files, commitMessage, path, branch } = this.state;
    const link = repository._links.fileUpload.href;

    this.setState({ loading: true });

    apiClient
      .postBinary(link.replace("{path}", path), formdata => {
        files.forEach((file, i) => formdata.append("file" + i, file));
        formdata.append("commit", JSON.stringify({commitMessage, branch}));
      })
      .then(() => history.push(sourcesLink))
      .catch(this.handleError);
  };

  render() {
    const {t, me, location, classes} = this.props;
    const {
      files,
      path,
      commitMessage,
      branch,
      revision,
      error,
      loading
    } = this.state;
    const sourcesLink =
      location.pathname.split("upload")[0] +
      "sources/" +
      (branch ? branch.replace("/", "%2F") : revision) +
      "/" +
      path;

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")} />
        <div className={classes.branch}>
          <InputField
            label={t("scm-editor-plugin.edit.selectedBranch")}
            className={classNames("is-fullwidth")}
            disabled={true}
            value={branch}
          />
        </div>
        <div className={classes.border}>
          <FilePath path={path} changePath={this.changePath}/>
          <FileUploadDropzone
            fileHandler={this.handleFile}
            disabled={loading}
          />
        </div>
        {files &&
        files.length > 0 && (
          <FileUploadTable
            files={files}
            removeFileEntry={this.removeFileEntry}
            disabled={loading}
          />
        )}
        {error && <ErrorNotification error={error} />}
        <CommitMessage
          me={me}
          commitMessage={commitMessage}
          onChange={this.changeCommitMessage}
          disabled={loading}
        />
        <br />
        <div className="level">
          <div className="level-left" />
          <div className="level-right">
            <ButtonGroup>
              <Button
                label={t("scm-editor-plugin.button.cancel")}
                link={sourcesLink}
                disabled={loading}
              />
              <Button
                label={t("scm-editor-plugin.button.commit")}
                color={"primary"}
                disabled={!commitMessage || files.length === 0}
                action={() => this.commitFile(sourcesLink)}
                loading={loading}
              />
            </ButtonGroup>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = state => {
  const { auth } = state;
  const me = auth.me;

  return {
    me
  };
};

export default compose(
  injectSheet(styles),
  translate("plugins"),
  withRouter,
  connect(mapStateToProps)
)(FileUpload);
