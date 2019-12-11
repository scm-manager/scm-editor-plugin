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
