// @flow
import React from "react";
import {translate} from "react-i18next";
import type {File} from "@scm-manager/ui-types";
import FileDeleteModal from "./FileDeleteModal";
import {apiClient} from "@scm-manager/ui-components";
import {withRouter} from "react-router-dom";
import styled from "styled-components";

const Button = styled.a`
  width: 50px;
  &:hover {
    color: #33b2e8;
  }
`;

const Pointer = styled.div`
    cursor: initial;
`;

type Props = {
  file: File,
  revision: string,
  handleExtensionError: (error: Error) => void,

  // context props
  location: any,
  history: History,
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
    const {
      file,
      revision,
      history,
      location,
      handleExtensionError
    } = this.props;
    this.setState({loading: true});
    apiClient
      .post(this.props.file._links.delete.href, {
        commitMessage: commitMessage,
        branch: revision
      }).then(r => r.text())
      .then(newRevision => {
        //TODO fix URL for Redirect
        history.push(
          location.pathname.substr(
            0,
            location.pathname.length - file.name.length - 1
          )
        );
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
    const {file, t} = this.props;
    const { showModal, loading } = this.state;

    const modal = showModal ? (
      <FileDeleteModal
        onClose={this.toggleModal}
        onCommit={this.deleteFile}
        file={file}
        loading={loading}
      />
    ) : null;

    return (
      <>
        <Pointer>{modal}</Pointer>
        {this.shouldRender() && (
          <Button
            title={t("scm-editor-plugin.delete.tooltip")}
            className="button"
            onClick={this.toggleModal}
          >
            <i className="fas fa-trash"/>
          </Button>
        )}
      </>
    );
  }
}

export default withRouter(translate("plugins")(FileDeleteButton));
