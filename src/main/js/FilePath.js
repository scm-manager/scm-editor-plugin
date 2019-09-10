// @flow
import React from "react";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import {InputField} from "@scm-manager/ui-components";

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

  //context props
  t: string => string,
  classes: any
};

class FilePath extends React.Component<Props> {
  changePath = path => {
    this.props.changePath(path);
  };

  changeFileName = fileName => {
    this.props.changeFileName(fileName);
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
