import React from "react";
import FileCreateButton from "./Create/FileCreateButton";
import FileUploadButton from "./Upload/FileUploadButton";
import {Branch, File} from "@scm-manager/ui-types";
import {ButtonGroup} from "@scm-manager/ui-components";

type Props = {
  baseUrl: string;
  path?: string;
  branch?: Branch;
  revision?: string;
  sources: File;
};

class SourcesActionbar extends React.Component<Props> {
  render() {
    const { baseUrl, path, branch, revision, sources } = this.props;
    return (
      <>
        <ButtonGroup>
          <FileCreateButton
            baseUrl={baseUrl}
            path={path}
            branch={branch}
            revision={revision}
            sources={sources}
          />
          <FileUploadButton
            baseUrl={baseUrl}
            path={path}
            branch={branch}
            revision={revision}
            sources={sources}
          />
        </ButtonGroup>
      </>
    );
  }
}

export default SourcesActionbar;
