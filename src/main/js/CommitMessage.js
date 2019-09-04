// @flow
import React from "react";
import {translate} from "react-i18next";
import {Textarea} from "@scm-manager/ui-components";
import {Me} from "@scm-manager/ui-types";
import injectSheet from "react-jss";

const styles = {
  marginBottom: {
    marginBottom: "0.5rem"
  }
};

type Props = {
  me: Me,
  onChange: string => void,
  //context props
  t: string => string,
  classes: any
};

class CommitMessage extends React.Component<Props> {

  render() {
    const {t, classes, me, onChange} = this.props;
    return (
      <>
        <div className={classes.marginBottom}>
          <span>
          <strong>
            {t("scm-editor-plugin.commit.author")}
          </strong>
          {"   "}
          {me.displayName + "  <" + me.mail + ">"}
        </span>
        </div>
        <Textarea
          placeholder={t("scm-editor-plugin.commit.placeholder")}
          onChange={(message) => onChange(message)}
        />
      </>
    );
  }
}

export default injectSheet(styles)(translate("plugins")(CommitMessage));
