import React from "react";
import { Route } from "react-router-dom";
import FileUpload from "./Upload/FileUpload";
import { Repository } from "@scm-manager/ui-types";
import FileEdit from "./Edit/FileEdit";

type Props = {
  url: any;
  repository: Repository;
  baseUrl: string;
};

class EditorNavigation extends React.Component<Props> {
  render() {
    const { url, repository, baseUrl } = this.props;

    return (
      <>
        <Route
          path={`${this.props.url}/upload/:path*`}
          render={() => <FileUpload url={url} repository={repository} baseUrl={baseUrl} />}
        />
        <Route
          path={`${this.props.url}/edit/:path*`}
          render={() => <FileEdit editMode={true} url={url} repository={repository} baseUrl={baseUrl} />}
        />
        <Route
          path={`${this.props.url}/create/:path*`}
          render={() => <FileEdit editMode={false} url={url} repository={repository} baseUrl={baseUrl} />}
        />
      </>
    );
  }
}

export default EditorNavigation;
