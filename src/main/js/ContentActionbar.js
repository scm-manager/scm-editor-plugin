// @flow

import React from "react";
import type {File} from "@scm-manager/ui-types";
import FileDeleteButton from "./Delete/FileDeleteButton";
import FileEditButton from "./Edit/FileEditButton";
import FileDownloadButton from "./Download/FileDownloadButton";
import {ButtonGroup} from "@scm-manager/ui-components";

type Props = {
  file: File,
  revision: string,
  handleExtensionError: (error: Error) => void
};

class ContentActionbar extends React.Component<Props> {
  render() {
    const {file, revision, handleExtensionError} = this.props;
    return (
      <>
        <ButtonGroup>
          <FileDeleteButton
            file={file}
            handleExtensionError={handleExtensionError}
            revision={revision}
          />
          <FileEditButton file={file}/>
          <FileDownloadButton file={file}/>
        </ButtonGroup>
      </>
    );
  }
}

export default ContentActionbar;
