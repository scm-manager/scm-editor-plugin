// @flow
import React from "react";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import {InputField, validation as validator} from "@scm-manager/ui-components";

const styles = {
  zeroflex: {
    flexBasis: "inherit",
    flexGrow: 0
  },
  minWidthOfControl: {
    minWidth: "20rem"
  },
  labelSizing: {
    fontSize: "1rem !important"
  },
  noBottomMargin: {
    marginBottom: "0 !important"
  },
  topBorder: {
    borderTop: "solid 1px #dbdbdb"
  },
  noBottomBorder: {
    borderBottom: "none"
  },
  alignItemsNormal: {
    alignItems: "normal"
  },
  inputBorder: {
    "& .input[disabled], .textarea[disabled]": {
      borderColor: "#b5b5b5"
    }
  }
};

type Props = {
  path: any,
  changePath: string => void,
  file?: File,
  changeFileName?: string => void,
  disabled?: boolean,
  validate?: void => boolean,

  //context props
  t: string => string,
  classes: any
};

type State = {
  pathValidationError: boolean,
  filenameValidationError: boolean
};

class FilePath extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      pathValidationError: false,
      filenameValidationError: false
    };
  }

  changePath = path => {
    //This promise chain is necessary, because the commit button validation
    //gets off by one when the states are not changed one after another
    new Promise(resolve => {
      resolve(() => {
      });
    })
      .then(() => this.props.changePath(path))
      .then(() =>
        this.setState({pathValidationError: !validator.isValidPath(path)})
      )
      .then(() => this.validate());
  };

  changeFileName = fileName => {
    //This promise chain is necessary, because the commit button validation
    //gets off by one when the states are not changed one after another
    new Promise((resolve) => {
      resolve(() => {
      });

    })
      .then(() => this.props.changeFileName(fileName))
      .then(() => this.setState({filenameValidationError: !fileName}))
      .then(() => this.validate());
  };

  validate = () => {
    this.props.validate(
      !(this.state.filenameValidationError || this.state.pathValidationError)
    );
  };

  render() {
    const {t, classes, file, disabled} = this.props;
    return (
      <div
        className={classNames(
          "panel-heading",
          classes.topBorder,
          disabled ? "" : classes.noBottomBorder
        )}
      >
        <div className={classNames("field", "is-horizontal")}>
          <div className="field-body level">
            <div className={classNames("level-left", classes.alignItemsNormal)}>
              <div
                className={classNames(
                  "field-label",
                  "is-normal",
                  classes.zeroflex
                )}
              >
                <label className={classNames("label", classes.labelSizing)}>
                  {t("scm-editor-plugin.path.path")}
                </label>
              </div>
              <div
                className={classNames(
                  "field",
                  "is-narrow",
                  classes.noBottomMargin
                )}
              >
                <div
                  className={classNames(
                    "control",
                    classes.minWidthOfControl,
                    disabled && classes.inputBorder
                  )}
                >
                  <InputField
                    className={classNames("is-fullwidth")}
                    disabled={disabled}
                    value={this.props.path}
                    validationError={this.state.pathValidationError}
                    errorMessage={t("scm-editor-plugin.validation.pathInvalid")}
                    placeholder={
                      !disabled && t("scm-editor-plugin.path.placeholder.path")
                    }
                    onChange={value => this.changePath(value)}
                  />
                </div>
              </div>
            </div>
            {file && (
              <div
                className={classNames("level-right", classes.alignItemsNormal)}
              >
                <div
                  className={classNames(
                    "field-label",
                    "is-normal",
                    classes.zeroflex
                  )}
                >
                  <label className={classNames("label", classes.labelSizing)}>
                    {t("scm-editor-plugin.path.filename")}
                  </label>
                </div>
                <div
                  className={classNames(
                    "control",
                    classes.minWidthOfControl,
                    disabled && classes.inputBorder
                  )}
                >
                  <InputField
                    className="is-fullwidth"
                    disabled={disabled}
                    value={file.name}
                    validationError={this.state.filenameValidationError}
                    errorMessage={t(
                      "scm-editor-plugin.validation.filenameInvalid"
                    )}
                    placeholder={
                      !disabled &&
                      t("scm-editor-plugin.path.placeholder.filename")
                    }
                    onChange={value => this.changeFileName(value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default injectSheet(styles)(translate("plugins")(FilePath));
