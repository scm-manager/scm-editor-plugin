import React, { Component } from "react";
import { Loading, ErrorNotification } from "@scm-manager/ui-components";
import { translate } from "react-i18next";

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-tomorrow";

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
};

class Editor extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  getLanguage = () => {
    const { language } = this.props;
    if (language) {
      return language.toLowerCase();
    }
    return "text";
  };

  // disabled for now, code splitting seems not work for plugins
  xcomponentDidMount() {
    const language = this.getLanguage();
    this.setState({
      loading: true,
      error: undefined
    });
    import(`ace-builds/src-noconflict/mode-${language}`)
      .then(() => {
        this.setState({
          loading: false,
          error: undefined
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          error
        });
      });
  }

  render() {
    const { content, disabled, onChange, t } = this.props;
    const { loading, error } = this.state;

    if (loading) {
      return <Loading />;
    } else if (error) {
      // TODO this is to hard, we should add a small error message
      // and fallback to text
      return <ErrorNotification error={error}/>;
    }

    const language = this.getLanguage();
    return (
        <AceEditor
          mode={language}
          theme="tomorrow"
          onChange={onChange}
          name="UNIQUE_ID_OF_DIV"
          value={content}
          readOnly={disabled}
          width="100%"
          fontSize="14px"
          placeholder={t("scm-editor-plugin.edit.placeholder")}
        />
    );
  }
}

export default translate("plugins")(Editor);
