import React from "react";
import Dropzone from "react-dropzone";
import { translate } from "react-i18next";
import styled from "styled-components";

const StyledDropzone = styled.div`
  width: 100%;
  cursor: pointer;
  padding: 2rem;
`;

const InnerBorder = styled.div`
  display: flex;
  padding: 3rem;
  height: 16rem;
  align-self: center;
  border: dashed 3px #cdcdcd;
  border-radius: 2px;
  justify-content: center;
  text-align: center;
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Icon = styled.i`
  margin: 1rem 0rem;
`;

type Props = {
  fileHandler: any;
  disabled: boolean;
  // context props
  t: (p: string) => string;
};

class FileUploadDropzone extends React.Component<Props> {
  onDrop = acceptedFiles => {
    this.props.fileHandler(acceptedFiles);
  };

  render() {
    const { t, disabled } = this.props;
    return (
      <>
        <Dropzone onDrop={acceptedFiles => this.onDrop(acceptedFiles)}>
          {({ getRootProps, getInputProps }) => {
            return (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} disabled={disabled} />
                  <StyledDropzone>
                    <InnerBorder>
                      <Description className="has-text-grey-light">
                        <Icon className="fas fa-plus-circle fa-2x has-text-grey-lighter" />
                        {t("scm-editor-plugin.upload.dragAndDrop")}
                      </Description>
                    </InnerBorder>
                  </StyledDropzone>
                </div>
              </section>
            );
          }}
        </Dropzone>
      </>
    );
  }
}

export default translate("plugins")(FileUploadDropzone);
