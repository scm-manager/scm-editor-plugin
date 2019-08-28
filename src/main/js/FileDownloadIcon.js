//@flow
import React from "react";
import injectSheet from "react-jss";
import classNames from "classnames";

const styles = {
  hover: {
    "&:hover": {
      color: "#363636"
    }
  }
};

type Props = {
  file: any,
  //context props
  classes: any
};

class FileDownloadIcon extends React.Component<Props> {

  render() {
    const {file, classes} = this.props;
    return (
      <>
        <a href={file._links.self.href} download={file.name}>
          <i className={classNames(classes.hover, `fas fa-download`)}/>
        </a>
      </>
    )
  }
}

export default injectSheet(styles)(FileDownloadIcon);
