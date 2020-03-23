/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
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
