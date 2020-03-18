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
import { compose } from "redux";
import { connect } from "react-redux";
import { WithTranslation, withTranslation } from "react-i18next";
import { Button, ButtonGroup, Modal } from "@scm-manager/ui-components";
import CommitMessage from "../CommitMessage";
import { File, Me } from "@scm-manager/ui-types";

type Props = WithTranslation & {
  file: File;
  me?: Me;
  onCommit: (p: string) => void;
  onClose: () => void;
  loading: boolean;
};

type State = {
  commitMessage: string;
};

class FileRemoveModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      commitMessage: ""
    };
  }

  changeCommitMessage = commitMessage => {
    this.setState({
      commitMessage
    });
  };

  render() {
    const { onCommit, onClose, loading, me, t } = this.props;
    const { commitMessage } = this.state;

    const body = (
      <CommitMessage
        me={me}
        commitMessage={this.state.commitMessage}
        onChange={this.changeCommitMessage}
        disabled={loading}
      />
    );

    const footer = (
      <ButtonGroup>
        <Button
          className="is-marginless"
          label={t("scm-editor-plugin.button.cancel")}
          action={onClose}
          disabled={loading}
        />
        <Button
          className="is-marginless"
          label={t("scm-editor-plugin.button.commit")}
          color="primary"
          disabled={!commitMessage}
          loading={loading}
          action={() => onCommit(this.state.commitMessage)}
        />
      </ButtonGroup>
    );

    return (
      <Modal
        title={t("scm-editor-plugin.delete.modal.title")}
        closeFunction={() => onClose()}
        body={body}
        footer={footer}
        active={true}
      />
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
  withTranslation("plugins"),
  connect(mapStateToProps)
)(FileRemoveModal);
