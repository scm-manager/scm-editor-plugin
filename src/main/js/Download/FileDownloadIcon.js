//@flow
import React from "react";
import styled from "styled-components";

const Icon = styled.a`
  color: #33b2e8;
  &:hover {
    color: #363636;
  }
`;

type Props = {
  file: any
};

class FileDownloadIcon extends React.Component<Props> {
  render() {
    const {file} = this.props;
    return (
      <>
        <Icon
          href={file._links.self.href}
          download={file.name}
        >
          <i className="fas fa-download"/>
        </Icon>
      </>
    );
  }
}

export default FileDownloadIcon;
