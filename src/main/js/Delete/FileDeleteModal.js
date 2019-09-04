//@flow
import React from "react";
import { translate } from "react-i18next";
import { Button, ButtonGroup, Modal } from "@scm-manager/ui-components";

type Props = {
  onClose: () => void,

  // context props
  t: string => string
};

class FileRemoveModal extends React.Component<Props> {
  deleteFile() {
    // TODO
  }

  render() {
    const { onClose, t } = this.props;

    const body = <></>; // TODO

    const footer = (
      <ButtonGroup>
        <Button
          className="is-marginless"
          label={t("scm-editor-plugin.delete.modal.confirm")}
          color="primary"
          action={() => this.deleteFile()}
        />
        <Button
          className="is-marginless"
          label={t("scm-editor-plugin.delete.modal.abort")}
          action={onClose}
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

export default translate("plugins")(FileRemoveModal);
