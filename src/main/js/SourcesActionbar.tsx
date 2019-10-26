import React from "react";
import FileCreateButton from "./Create/FileCreateButton";
import FileUploadButton from "./Upload/FileUploadButton";
import { Branch, Repository } from "@scm-manager/ui-types";
import { ButtonGroup } from "@scm-manager/ui-components";

type Props = {
  repository: Repository;
  baseUrl: string;
  path?: string;
  branch?: Branch;
  revision?: string;
  isBranchUrl: boolean;
};

class SourcesActionbar extends React.Component<Props> {
  render() {
    const { repository, baseUrl, path, branch, revision, isBranchUrl } = this.props;
    return (
      <>
        <ButtonGroup>
          <FileCreateButton
            baseUrl={baseUrl}
            repository={repository}
            path={path}
            branch={branch}
            revision={revision}
            isBranchUrl={isBranchUrl}
          />
          <FileUploadButton
            baseUrl={baseUrl}
            repository={repository}
            path={path}
            branch={branch}
            revision={revision}
            isBranchUrl={isBranchUrl}
          />
        </ButtonGroup>
      </>
    );
  }
}

export default SourcesActionbar;
