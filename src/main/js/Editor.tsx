import React, { Component } from "react";
import { Loading, ErrorNotification } from "@scm-manager/ui-components";
import { translate } from "react-i18next";

import AceEditor from "react-ace";
import "./EditorTheme.js";

const defaultLanguage = "text";

type Props = {
  content: string;
  language: string;
  disabled: boolean;
  onChange: (value: string, name?: string) => void;
  t: (key: string) => string;
};

type State = {
  loading?: boolean;
  error?: Error;
  language?: string;
};

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
    if (language) {
      return language.toLowerCase();
    }
    return defaultLanguage;
  };

  // disabled for now, code splitting seems not work for plugins
  componentDidMount() {
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
          language,
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          error,
          language: defaultLanguage
        });
      });
  }

  render() {
    const { content, disabled, onChange, t } = this.props;
    const { language, loading, error } = this.state;

    if (loading) {
      return <Loading />;
    } else if (error) {
      return <ErrorNotification error={error}/>;
    }

    return (
        <AceEditor
          mode={language}
          theme="arduino-light"
          onChange={onChange}
          name="UNIQUE_ID_OF_DIV"
          value={content}
          readOnly={disabled}
          width="100%"
          fontSize="14px"
          setOptions={{useWorker: false}}
          placeholder={t("scm-editor-plugin.edit.placeholder")}
        />
    );
  }
}

export default translate("plugins")(Editor);
