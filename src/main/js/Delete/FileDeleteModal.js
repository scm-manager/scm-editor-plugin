//@flow
import React from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, ButtonGroup, Modal} from "@scm-manager/ui-components";
import CommitMessage from "../CommitMessage";
import type {File, Me} from "@scm-manager/ui-types";

type Props = {
  file: File,
  me?: Me,
  onCommit: string => void,
  onClose: () => void,
  loading: boolean,

  // context props
  t: string => string
};

type State = {
  commitMessage: string
};

class FileRemoveModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      commitMessage: ""
    };
  }

  changeCommitMessage = commitMessage => {
    this.setState({ commitMessage });
  };

  render() {
    const { onCommit, onClose, loading, me, t } = this.props;
    const { commitMessage } = this.state;

    const body = <CommitMessage
      me={me}
      commitMessage={this.state.commitMessage}
      onChange={this.changeCommitMessage}
      disabled={loading}
    />;

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

export default compose(translate("plugins"), connect(mapStateToProps))(FileRemoveModal);
