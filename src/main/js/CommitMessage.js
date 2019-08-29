// @flow
import React from "react";
import {translate} from "react-i18next";
import {Textarea} from "@scm-manager/ui-components"


type Props = {
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
    const {t} = this.props;
    return (
      <>
        <span>
          <strong>
            {t("scm-editor-plugin.commit.author")}
          </strong>
          {" "}
          {"AuthorName"}
        </span>
        <Textarea/>
      </>
    )
  }
}

export default translate("plugins")(CommitMessage);
