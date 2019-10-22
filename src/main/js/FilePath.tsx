import React from "react";
import { translate } from "react-i18next";
import classNames from "classnames";
import { InputField, validation as validator } from "@scm-manager/ui-components";
import styled from "styled-components";

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

const InputBorder = styled.div`
  ${props =>
    props.disabled
      ? " & .input, .textarea {border-color: #b5b5b5\n },\n & .input[disabled], .textarea[disabled] {\n    border-color: #b5b5b5;\n }"
      : ""};
`;

type Props = {
  path: any;
  changePath: (p: string) => void;
  file?: File;
  changeFileName?: (p: string) => void;
  disabled?: boolean;
  validate?: (p: void) => boolean;

  //context props
  t: (p: string) => string;
};

type State = {
  pathValidationError: boolean;
  filenameValidationError: boolean;
};

class FilePath extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      pathValidationError: false,
      filenameValidationError: false
    };
  }

  changePath = path => {
    this.props.changePath(path);
    this.setState({
      pathValidationError: !validator.isPathValid(path)
    });
  };

  changeFileName = fileName => {
    this.props.changeFileName(fileName);
    this.setState(
      {
        filenameValidationError: !fileName
      },
      this.validate
    );
  };

  validate = () => {
    this.props.validate(!(this.state.filenameValidationError || this.state.pathValidationError));
  };

  render() {
    const { t, file, disabled } = this.props;
    return (
      <NoTopBorder>
        <NoBorder className="panel-heading">
          <AlignItemNormal>
            <div className={classNames("field-label", "is-normal")}>
              <LabelSizing className="label">{t("scm-editor-plugin.path.path")}</LabelSizing>
            </div>
            <NoBottomMargin className="field">
              <InputBorder disabled={disabled} className="control">
                <InputField
                  className={classNames("is-fullwidth")}
                  disabled={disabled}
                  value={this.props.path}
                  validationError={this.state.pathValidationError}
                  errorMessage={t("scm-editor-plugin.validation.pathInvalid")}
                  placeholder={!disabled && t("scm-editor-plugin.path.placeholder.path")}
                  onChange={value => this.changePath(value)}
                />
              </InputBorder>
            </NoBottomMargin>
          </AlignItemNormal>
          {file && (
            <AlignItemNormal>
              <div className={classNames("field-label", "is-normal")}>
                <LabelSizing className="label">{t("scm-editor-plugin.path.filename")}</LabelSizing>
              </div>
              <InputBorder disabled={disabled} className="control">
                <InputField
                  className="is-fullwidth"
                  disabled={disabled}
                  value={file.name}
                  validationError={this.state.filenameValidationError}
                  errorMessage={t("scm-editor-plugin.validation.filenameInvalid")}
                  placeholder={!disabled && t("scm-editor-plugin.path.placeholder.filename")}
                  onChange={value => this.changeFileName(value)}
                />
              </InputBorder>
            </AlignItemNormal>
          )}
        </NoBorder>
      </NoTopBorder>
    );
  }
}

export default translate("plugins")(FilePath);
