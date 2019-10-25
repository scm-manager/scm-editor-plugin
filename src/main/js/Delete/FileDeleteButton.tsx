import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { File } from "@scm-manager/ui-types";
import FileDeleteModal from "./FileDeleteModal";
import { apiClient } from "@scm-manager/ui-components";
import { withRouter, RouteComponentProps } from "react-router-dom";
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

type Props = WithTranslation & RouteComponentProps & {
  file: File;
  revision: string;
  handleExtensionError: (error: Error) => void;
};

type State = {
  showModal: boolean;
  loading: boolean;
  error: Error;
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
    this.setState({
      loading: true
    });
    apiClient
      .post(this.props.file._links.delete.href, {
        commitMessage: commitMessage,
        branch: revision
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
    const { file, t } = this.props;
    const { showModal, loading } = this.state;

    const modal = showModal ? (
      <FileDeleteModal onClose={this.toggleModal} onCommit={this.deleteFile} file={file} loading={loading} />
    ) : null;

    return (
      <>
        <Pointer>{modal}</Pointer>
        {this.shouldRender() && (
          <Button title={t("scm-editor-plugin.delete.tooltip")} className="button" onClick={this.toggleModal}>
            <i className="fas fa-trash" />
          </Button>
        )}
      </>
    );
  }
}

export default withRouter(withTranslation("plugins")(FileDeleteButton));
