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
    minWidth: "10rem"
  },
  labelSizing: {
    fontSize: "1rem !important"
  },
  noBottomMargin: {
    marginBottom: "0 !important"
  },
  topBorder: {
    borderTop: "solid 1px #dbdbdb"
  }
};

type Props = {
  path: any,

  //context props
  t: string => string,
  classes: any
};

class FileUploadPath extends React.Component<Props> {

  render() {
    const {t, classes} = this.props;
    return (
      <>
        <div className={classNames("panel-heading", classes.topBorder)}>
          <div
            className={classNames(
              "field",
              "is-horizontal"
            )}
          >
            <div
              className={classNames("field-label", "is-normal", classes.zeroflex)}
            >
              <label className={classNames("label", classes.labelSizing)}>
                {t("scm-editor-plugin.upload.path")}
              </label>
            </div>
            <div className="field-body">
              <div
                className={classNames(
                  "field",
                  "is-narrow",
                  classes.noBottomMargin
                )}
              >
                <div className={classNames("control", classes.minWidthOfControl)}>
                  <InputField
                    className="is-fullwidth"
                    disabled={false}
                    value={this.props.path}
                    placeholder={t("scm-editor-plugin.upload.placeholder")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default injectSheet(styles)(translate("plugins")(FileUploadPath));
