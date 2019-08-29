//@flow
import React from "react";
import {Route, Switch} from "react-router-dom";
import {translate} from "react-i18next";
import type {History} from "history";
import FileUpload from "./Upload/FileUpload";

import {withRouter} from "react-router-dom";


type Props = {
  url: any,

  // context props
  t: string => string,
  history: History,
  match: any
};

class EditorNavigation extends React.Component<Props> {

  render() {

    return (
      <Route
        path={`${this.props.url}/upload/:path`} //TODO add query ?branch=branch&revision=revision
        render={() => (
          <FileUpload
            path={this.props.match.params.path}
          />
        )}
      />
    );
  }
}

export default withRouter(translate("plugins")(EditorNavigation));
