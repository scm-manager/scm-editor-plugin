import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Textarea } from "@scm-manager/ui-components";
import { Me } from "@scm-manager/ui-types";
import styled from "styled-components";

const MarginBottom = styled.div`
  margin-bottom: 0.5rem;
`;

type Props = WithTranslation & {
  me: Me;
  onChange: (p: string) => void;
  disabled: boolean;
};

class CommitMessage extends React.Component<Props> {
  render() {
    const { t, me, onChange, disabled } = this.props;
    return (
      <>
        <MarginBottom>
          <span>
            <strong>{t("scm-editor-plugin.commit.author")}</strong> {me.displayName + " <" + me.mail + ">"}
          </span>
        </MarginBottom>
        <Textarea
          placeholder={t("scm-editor-plugin.commit.placeholder")}
          onChange={message => onChange(message)}
          disabled={disabled}
        />
      </>
    );
  }
}

export default withTranslation("plugins")(CommitMessage);
