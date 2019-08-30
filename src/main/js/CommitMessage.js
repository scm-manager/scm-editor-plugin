// @flow
import React from "react";
import {translate} from "react-i18next";
import {Textarea} from "@scm-manager/ui-components";
import {Me} from "@scm-manager/ui-types";

type Props = {
  me: Me,
  //context props
  t: string => string,
};

type State = {
  message: string
};

class CommitMessage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      message: ""
    };
  }

  render() {
    const {t, me} = this.props;
    return (
      <>
        <span>
          <strong>
            {t("scm-editor-plugin.commit.author")}
          </strong>
          {"   "}
          {me.displayName + "  <" + me.mail + ">"}
        </span>
        <Textarea
          placeholder={t("scm-editor-plugin.commit.placeholder")}
        />
      </>
    )
  }
}

export default translate("plugins")(CommitMessage);
