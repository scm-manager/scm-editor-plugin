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
  inputField: {},
  labelSizing: {
    fontSize: "1rem !important"
  },
  noBottomMargin: {
    marginBottom: "0 !important"
  },
  noBorder: {
    border: "none"
  },
  noTopBorder: {
    "& .panel-heading:first-child, .panel-tabs:first-child, .panel-block:first-child": {
      border: "none"
    }
  },
  alignItemsNormal: {
    alignItems: "normal"
  },
  inputBorder: {
    "& .input, .textarea": {
      borderColor: "#b5b5b5"
    },
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
    this.props.changePath(path);
    this.setState({pathValidationError: !validator.isValidPath(path)});
  };

  changeFileName = fileName => {
    this.props.changeFileName(fileName);
    this.setState({filenameValidationError: !fileName}, this.validate);
  };

  validate = () => {
    this.props.validate(
      !(this.state.filenameValidationError || this.state.pathValidationError)
    );
  };

  render() {
    const {t, classes, file, disabled} = this.props;
    return (
      <div className={classes.noTopBorder}>
        <div className={classNames("panel-heading", classes.noBorder)}>
          <div className={classNames("field", "is-horizontal")}>
            <div className="field-body level">
              <div
                className={classNames("level-left", classes.alignItemsNormal)}
              >
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
                      errorMessage={t(
                        "scm-editor-plugin.validation.pathInvalid"
                      )}
                      placeholder={
                        !disabled &&
                        t("scm-editor-plugin.path.placeholder.path")
                      }
                      onChange={value => this.changePath(value)}
                    />
                  </div>
                </div>
              </div>
              {file && (
                <div
                  className={classNames(
                    "level-right",
                    classes.alignItemsNormal
                  )}
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
      </div>
    );
  }
}

export default injectSheet(styles)(translate("plugins")(FilePath));
