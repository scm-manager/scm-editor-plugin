//@flow
import React from "react";
import {Route} from "react-router-dom";
import FileUpload from "./Upload/FileUpload";


type Props = {
  url: any
};

class EditorNavigation extends React.Component<Props> {

  render() {

    return (
      <Route
        path={`${this.props.url}/upload/:path*`}
        render={() => (
          <FileUpload/>
        )}
      />
    );
  }
}

export default EditorNavigation;
