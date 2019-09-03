// @flow
import React from "react";
import Dropzone from "react-dropzone";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";

const styles = {
  dropzone: {
    width: "100%",
    height: "20rem",
    border: "solid 1px #dbdbdb",
    borderRadius: "2px"
  },
  innerBorder: {
    margin: "2rem",
    height: "16rem",
    alignSelf: "center",
    border: "dashed 3px #cdcdcd",
    borderRadius: "2px",
    display: "flex",
    justifyContent: "center"
  },
  description: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  icon: {
    margin: "1rem 0rem"
  }
};

type Props = {
  fileHandler: any,
  // context props
  t: string => string,
  classes: any
}


class FileUploadDropzone extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  onDrop = (acceptedFiles) => {
    this.props.fileHandler(acceptedFiles);
  };

  render() {
    const {t, classes} = this.props;
    return (
      <>
        <Dropzone onDrop={acceptedFiles => this.onDrop(acceptedFiles)}>
          {({getRootProps, getInputProps}) => {
            return (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className={classes.dropzone}>
                    <div className={classes.innerBorder}>
                      <div className={classNames(classes.description, "has-text-grey-light")}>
                        <i className={classNames("fas fa-plus-circle fa-2x has-text-grey-lighter", classes.icon)}/>
                        {t("scm-editor-plugin.upload.dragAndDrop")}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          }}
        </Dropzone>
      </>
    );
  }
}

export default injectSheet(styles)(translate("plugins")(FileUploadDropzone));
