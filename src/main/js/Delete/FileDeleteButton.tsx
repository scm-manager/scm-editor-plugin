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

type Props = WithTranslation &
  RouteComponentProps & {
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

    // @ts-ignore
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
      .then(r => r.json())
      .then(newCommit => {
        if (newCommit) {
          const newRevision =
            newCommit._embedded &&
            newCommit._embedded.branches &&
            newCommit._embedded.branches[0] &&
            newCommit._embedded.branches[0].name
              ? newCommit._embedded.branches[0].name
              : newCommit.id;
          const filePath = location.pathname
            .substr(0, location.pathname.length - file.name.length - 1)
            .split("/sources/" + revision)[1];
          const redirectUrl = location.pathname.split("/sources")[0] + `/sources/${newRevision}${filePath}`;
          history.push(redirectUrl);
        }
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
