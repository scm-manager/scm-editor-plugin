import React, {FC} from "react";
import { translate } from "react-i18next";
import classNames from "classnames";
import { InputField, validation as validator } from "@scm-manager/ui-components";
import styled from "styled-components";
import LanguageSelector from "./LanguageSelector";

const LabelSizing = styled.label`
  font-size: 1rem !important;
`;

const NoBottomMargin = styled.div`
  margin-bottom: 0 !important;
`;

const NoBorder = styled.div`
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const NoTopBorder = styled.div`
  & .panel-heading:first-child,
  .panel-tabs:first-child,
  .panel-block:first-child {
    border: none;
  }
`;

const AlignItemNormal = styled.div`
  align-items: normal;
  display: flex;
`;

type InputBorderProps = {
  disabled?: boolean;
};

const InputBorder = styled.div<InputBorderProps>`
  ${props =>
    props.disabled
      ? " & .input, .textarea {border-color: #b5b5b5\n },\n & .input[disabled], .textarea[disabled] {\n    border-color: #b5b5b5;\n }"
      : ""};
`;

const FieldLabel: FC<{value: string}> = ({value}) => (
  <div className="field-label is-normal">
    <LabelSizing className="label">{value}</LabelSizing>
  </div>
);

type Props = {
  path: any;
  changePath: (p: string) => void;
  file?: File;
  changeFileName?: (p: string) => void;
  disabled?: boolean;
  validate?: (p: void) => boolean;
  language?: string;
  changeLanguage?: (lang: string) => void;

  //context props
  t: (p: string) => string;
};

type State = {
  pathValidationError: boolean;
  filenameValidationError: boolean;
};

class FileMetaData extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pathValidationError: false,
      filenameValidationError: false
    };
  }

  changePath = (path: string) => {
    this.props.changePath(path);
    this.setState({
      pathValidationError: !validator.isPathValid(path)
    });
  };

  changeFileName = (fileName: string) => {
    const { changeFileName } = this.props;
    if (changeFileName) {
      changeFileName(fileName);
      this.setState(
        {
          filenameValidationError: !fileName
        },
        this.validate
      );
    }
  };

  onLanguageChange = (language: string) => {
    const { changeLanguage } = this.props;
    if (changeLanguage) {
      changeLanguage(language);
    }
  };

  validate = () => {
    this.props.validate(!(this.state.filenameValidationError || this.state.pathValidationError));
  };

  render() {
    const { t, file, language, disabled } = this.props;
    return (
      <NoTopBorder>
        <NoBorder className="panel-heading">
          <AlignItemNormal>
            <FieldLabel value={t("scm-editor-plugin.path.path")} />
            <NoBottomMargin className="field">
              <InputBorder disabled={disabled} className="control">
                <InputField
                  disabled={disabled}
                  value={this.props.path}
                  validationError={this.state.pathValidationError}
                  errorMessage={t("scm-editor-plugin.validation.pathInvalid")}
                  placeholder={disabled ? "" : t("scm-editor-plugin.path.placeholder.path")}
                  onChange={value => this.changePath(value)}
                />
              </InputBorder>
            </NoBottomMargin>
          </AlignItemNormal>
          {file && (
            <>
              <AlignItemNormal>
                <FieldLabel value={t("scm-editor-plugin.path.filename")} />
                <InputBorder disabled={disabled} className="control">
                  <InputField
                    disabled={disabled}
                    value={file.name}
                    validationError={this.state.filenameValidationError}
                    errorMessage={t("scm-editor-plugin.validation.filenameInvalid")}
                    placeholder={disabled ? "" : t("scm-editor-plugin.path.placeholder.filename")}
                    onChange={value => this.changeFileName(value)}
                  />
                </InputBorder>
              </AlignItemNormal>
              <AlignItemNormal>
                <FieldLabel value={t("scm-editor-plugin.path.language")} />
                <InputBorder disabled={disabled} className="control">
                  <LanguageSelector selected={language} onChange={this.onLanguageChange} />
                </InputBorder>
              </AlignItemNormal>
            </>
          )}
        </NoBorder>
      </NoTopBorder>
    );
  }
}

export default translate("plugins")(FileMetaData);
