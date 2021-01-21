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
import { File, Link } from "@scm-manager/ui-types";
import FileDeleteModal from "./FileDeleteModal";
import {apiClient, createAttributesForTesting} from "@scm-manager/ui-components";
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
      .post((this.props.file._links.delete as Link).href, {
        commitMessage: commitMessage,
        branch: decodeURIComponent(revision)
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
          const redirectUrl =
            location.pathname.split("/sources")[0] + `/sources/${encodeURIComponent(newRevision)}${filePath}`;
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
          <Button title={t("scm-editor-plugin.delete.tooltip")} className="button" onClick={this.toggleModal} {...createAttributesForTesting("delete-file-button")}>
            <i className="fas fa-trash" />
          </Button>
        )}
      </>
    );
  }
}

export default withRouter(withTranslation("plugins")(FileDeleteButton));
