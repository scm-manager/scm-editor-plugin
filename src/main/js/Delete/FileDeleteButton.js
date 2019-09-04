// @flow
import React from "react";
import { translate } from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import type { File } from "@scm-manager/ui-types";
import FileDeleteModal from "./FileDeleteModal";

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

  // context props
  classes: any,
  t: string => string
};

type State = {
  showModal: boolean
};

class FileDeleteButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  toggleModal = () => {
    this.setState(prevState => ({
      showModal: !prevState.showModal
    }));
  };

  render() {
    const { classes, t } = this.props;
    const { showModal } = this.state;

    const modal = showModal ? (
      <FileDeleteModal onClose={this.toggleModal} />
    ) : null;

    return (
      <>
        <div className={classes.pointer}>{modal}</div>
        <a
          title={t("scm-editor-plugin.delete.tooltip")}
          className={classNames(classes.button, "button")}
          onClick={this.toggleModal}
        >
          <i className="fas fa-trash" />
        </a>
      </>
    );
  }
}

export default injectSheet(styles)(translate("plugins")(FileDeleteButton));
