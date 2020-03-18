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
import React, { Component } from "react";
import styled from "styled-components";
import { Loading, ErrorNotification } from "@scm-manager/ui-components";
import { WithTranslation, withTranslation } from "react-i18next";

import AceEditor from "react-ace";
import "./EditorTheme.js";
import findLanguage from "./findLanguage";

const defaultLanguage = "text";

type Props = WithTranslation & {
  content: string;
  language: string;
  disabled: boolean;
  onChange: (value: string, name?: string) => void;
};

type State = {
  loading?: boolean;
  error?: Error;
  language?: string;
};

const StyledAceEditor = styled(AceEditor)`
  .ace_placeholder {
    font-family: inherit;
    transform: scale(1);
  }
`;

class Editor extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      language: defaultLanguage
    };
  }

  getLanguage = () => {
    const { language } = this.props;
    return findLanguage(language);
  };

  // disabled for now, code splitting seems not work for plugins
  componentDidMount() {
    this.loadLanguage();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.language !== this.props.language) {
      this.loadLanguage();
    }
  }

  loadLanguage = () => {
    const language = this.getLanguage();
    this.setState({
      loading: true,
      error: undefined
    });
    import(`ace-builds/src-noconflict/mode-${language}`)
      .then(() => {
        this.setState({
          loading: false,
          error: undefined,
          language
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          error,
          language: defaultLanguage
        });
      });
  };

  render() {
    const { content, disabled, onChange, t } = this.props;
    const { language, loading, error } = this.state;

    if (loading) {
      return <Loading />;
    } else if (error) {
      return <ErrorNotification error={error} />;
    }

    return (
      <StyledAceEditor
        mode={language}
        theme="arduino-light"
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        value={content}
        readOnly={disabled}
        width="100%"
        fontSize="14px"
        setOptions={{ useWorker: false }}
        placeholder={t("scm-editor-plugin.edit.placeholder")}
      />
    );
  }
}

export default withTranslation("plugins")(Editor);
