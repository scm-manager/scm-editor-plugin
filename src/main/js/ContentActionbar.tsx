import React from "react";
import { Repository, File } from "@scm-manager/ui-types";
import FileDeleteButton from "./Delete/FileDeleteButton";
import FileEditButton from "./Edit/FileEditButton";
import FileDownloadButton from "./Download/FileDownloadButton";
import { ButtonGroup } from "@scm-manager/ui-components";

type Props = {
  repository: Repository;
  file: File;
  revision: string;
  handleExtensionError: (error: Error) => void;
};

class ContentActionbar extends React.Component<Props> {
  render() {
    const { repository, file, revision, handleExtensionError } = this.props;
    return (
      <ButtonGroup>
        <FileDeleteButton file={file} handleExtensionError={handleExtensionError} revision={revision} />
        <FileEditButton repository={repository} revision={revision} file={file} />
        <FileDownloadButton file={file} />
      </ButtonGroup>
    );
  }
}

export default ContentActionbar;
