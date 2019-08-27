//@flow
import React from "react";

type Props = {
  downloadUrl: any,
};

class FileDownloadIcon extends React.Component<Props> {

  render() {
    return (
      <>
        <div>
          <i className={`fas has-text-link fa-download`}/>
          <a href={this.props.downloadUrl} download/>
        </div>
      </>
    )
  }
}

export default FileDownloadIcon;
