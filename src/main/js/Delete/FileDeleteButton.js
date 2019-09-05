// @flow
import React from "react";
import {compose} from "redux";
import { translate } from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import type { File } from "@scm-manager/ui-types";
import FileDeleteModal from "./FileDeleteModal";
import {apiClient} from "@scm-manager/ui-components";
import {withRouter} from "react-router-dom";

const styles = {
  button: {
    width: "50px",
    "&:hover": {
      color: "#33b2e8"
    }
  },
  /* resets pointer styling of Sources Content */
  pointer: {
    cursor: "initial"
  }
};

type Props = {
  file: File,
  revision: string,
  handleExtensionError: (error: Error) => void,

  // context props
  classes: any,
  location: any,
  history: any,
  t: string => string
};

type State = {
  showModal: boolean,
  loading: boolean,
  error: Error
};

class FileDeleteButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showModal: false,
      loading: false
    };
  }

  toggleModal = () => {
    this.setState(prevState => ({
      showModal: !prevState.showModal
    }));
  };

  deleteFile = (commitMessage: string) => {
    const { file, revision, history, location, handleExtensionError } = this.props;
    this.setState({loading: true});
    apiClient
      .post(this.props.file._links.delete.href, {
        commitMessage: commitMessage,
        branch: revision,
        expectedRevision: file.revision
      })
      .then(() => {
        history.push(location.pathname.substr(0, location.pathname.length - file.name.length - 1));
      })
      .catch(error => {
        this.toggleModal();
        handleExtensionError(error);
      });
  };

  shouldRender = () => {
    return !!this.props.file._links.delete;
  };

  render() {
    const { file, classes, t } = this.props;
    const { showModal, loading } = this.state;

    const modal = showModal ? (
      <FileDeleteModal onClose={this.toggleModal} onCommit={this.deleteFile} file={file} loading={loading} />
    ) : null;

    return (
      <>
        <div className={classes.pointer}>{modal}</div>
        {this.shouldRender() && (
          <a
            title={t("scm-editor-plugin.delete.tooltip")}
            className={classNames(classes.button, "button")}
            onClick={this.toggleModal}
          >
            <i className="fas fa-trash"/>
          </a>
        )}
      </>);
  }
}

export default compose(injectSheet(styles), translate("plugins"), withRouter)(FileDeleteButton);
