import React from "react";
import FileCreateButton from "./Create/FileCreateButton";
import FileUploadButton from "./Upload/FileUploadButton";
import { File, Repository } from "@scm-manager/ui-types";
import { ButtonGroup } from "@scm-manager/ui-components";

type Props = {
  repository: Repository;
  path?: string;
  revision?: string;
  sources: File;
};

class SourcesActionbar extends React.Component<Props> {
  render() {
    return (
      <ButtonGroup>
        <FileCreateButton {...this.props} />
        <FileUploadButton {...this.props} />
      </ButtonGroup>
    );
  }
}

export default SourcesActionbar;
