//@flow
import React from "react";
import {Route} from "react-router-dom";
import FileUpload from "./Upload/FileUpload";
import {Repository} from "@scm-manager/ui-types";

type Props = {
  url: any,
  repository: Repository
};

class EditorNavigation extends React.Component<Props> {

  render() {
    const {url, repository} = this.props;

    return (
      <Route
        path={`${this.props.url}/upload/:path*`}
        render={() => (
          <FileUpload url={url} repository={repository}/>
        )}
      />
    );
  }
}

export default EditorNavigation;
