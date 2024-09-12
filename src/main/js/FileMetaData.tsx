/*
 * Copyright (c) 2020 - present Cloudogu GmbH
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
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
