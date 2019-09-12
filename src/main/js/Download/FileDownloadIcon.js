//@flow
import React from "react";
import injectSheet from "react-jss";

const styles = {
  icon: {
    color: "#33b2e8",
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
        <a
          className={classes.icon}
          href={file._links.self.href}
          download={file.name}
        >
          <i className="fas fa-download"/>
        </a>
      </>
    );
  }
}

export default injectSheet(styles)(FileDownloadIcon);
