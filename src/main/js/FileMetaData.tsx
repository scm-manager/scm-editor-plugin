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
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import LanguageSelector from "./LanguageSelector";
import { useDirectoryValidation, useFilenameValidation } from "./validation";
import { InputField } from "@scm-manager/ui-components";

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

const FieldLabel: FC<{ value: string }> = ({ value }) => (
  <div className="field">
    <label className="label is-size-6">{value}</label>
  </div>
);

type Props = {
  path: string | undefined;
  changePath: (p: string) => void;
  file?: any;
  changeFileName?: (p: string) => void;
  disabled?: boolean;
  validate?: (p: boolean) => void;
  language?: string;
  changeLanguage?: (lang: string) => void;
  onBlur: () => void;
  autoFocus?: boolean;
};

const FileMetaData: FC<Props> = ({
  path,
  changePath,
  file,
  changeFileName,
  disabled,
  validate,
  language,
  changeLanguage,
  onBlur,
  autoFocus
}) => {
  const [t] = useTranslation("plugins");
  const [validateFilename, filenameErrorMessage] = useFilenameValidation();
  const [validateDirectory, directoryErrorMessage] = useDirectoryValidation();

  const handlePathChange = (path: string) => {
    changePath(path);
    validateDirectory(path);
  };

  const handleFileNameChange = (fileName: string) => {
    if (changeFileName) {
      changeFileName(fileName);
      validateFilename(fileName);
      onValidate();
    }
  };

  const handleLanguageChange = (language: string) => {
    if (changeLanguage) {
      changeLanguage(language);
    }
  };

  const onValidate = () => {
    if (validate) {
      validate(!(filenameErrorMessage || directoryErrorMessage));
    }
  };

  return (
    <NoTopBorder>
      <PathBlock>
        <AlignItemNormal>
          <FieldLabel value={t("scm-editor-plugin.path.path")} />
          <NoBottomMargin className="field">
            <InputBorder disabled={disabled} className="control">
              <InputField
                disabled={disabled}
                value={path}
                validationError={!!directoryErrorMessage}
                errorMessage={directoryErrorMessage}
                placeholder={disabled ? "" : t("scm-editor-plugin.path.placeholder.path")}
                onChange={handlePathChange}
                testId="create-file-path-input"
                onBlur={onBlur}
                autofocus={autoFocus}
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
                  onChange={handleFileNameChange}
                  disabled={disabled}
                  value={file.name}
                  validationError={!!filenameErrorMessage}
                  errorMessage={filenameErrorMessage}
                  testId="create-file-name-input"
                />
              </InputBorder>
            </AlignItemNormal>
            <AlignItemNormal>
              <FieldLabel value={t("scm-editor-plugin.path.language")} />
              <InputBorder disabled={disabled} className="control">
                <LanguageSelector selected={language} onChange={handleLanguageChange} />
              </InputBorder>
            </AlignItemNormal>
          </>
        )}
      </PathBlock>
    </NoTopBorder>
  );
};

export default FileMetaData;
