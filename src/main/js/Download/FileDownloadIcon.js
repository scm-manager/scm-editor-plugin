//@flow
import React from "react";

type Props = {
  file: any
};

class FileDownloadIcon extends React.Component<Props> {
  render() {
    const { file } = this.props;
    return (
      <>
        <a href={file._links.self.href} download={file.name}>
          <i className={"fas has-text-link fa-download"} />
        </a>
      </>
    );
  }
}

export default FileDownloadIcon;
