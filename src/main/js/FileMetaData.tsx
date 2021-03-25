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
import React, { FC } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { InputField, validation as validator } from "@scm-manager/ui-components";
import styled from "styled-components";
import LanguageSelector from "./LanguageSelector";

const NoBottomMargin = styled.div`
  margin-bottom: 0 !important;
`;

const PathBlock = styled.div`
  padding: 1.5em 1em;
  border-bottom: solid 1px #dbdbdb;
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
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  align-items: normal;
  display: flex;
  padding-right: 0.5em;
  flex-direction: column;
`;

type InputBorderProps = {
  disabled?: boolean;
};

const InputBorder = styled.div<InputBorderProps>`
  ${props =>
    props.disabled &&
    `
    & .input, 
    .textarea {
      border-color: #b5b5b5;
     }
     
     & .input[disabled], 
     .textarea[disabled] {
      border-color: #b5b5b5;
     }`}
`;

const LabelSizing = styled.label`
  font-size: 1rem !important;
`;

const FieldLabel: FC<{ value: string }> = ({ value }) => (
  <div className="field">
    <LabelSizing className="label">{value}</LabelSizing>
  </div>
);

type Props = WithTranslation & {
  path: any;
  changePath: (p: string) => void;
  file?: File;
  changeFileName?: (p: string) => void;
  disabled?: boolean;
  validate?: (p: void) => boolean;
  language?: string;
  changeLanguage?: (lang: string) => void;
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
          filenameValidationError: !validator.isFilenameValid(fileName)
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
        <PathBlock>
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
                  testId="create-file-path-input"
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
                    testId="create-file-name-input"
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
        </PathBlock>
      </NoTopBorder>
    );
  }
}

export default withTranslation("plugins")(FileMetaData);
