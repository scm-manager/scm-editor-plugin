/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { File, Link, Repository } from "@scm-manager/ui-types";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { apiClient, createAttributesForTesting } from "@scm-manager/ui-components";
import { isEditable } from "./isEditable";
import styled from "styled-components";
import { createSourceExtensionUrl } from "../links";

const Button = styled.a`
  width: 50px;
  &:hover {
    color: #33b2e8;
  }
`;

type Props = WithTranslation &
  RouteComponentProps & {
    repository: Repository;
    revision: string;
    file: File;
  };

type State = {
  contentType?: string | null;
  language?: string | null;
  loading: boolean;
};

class FileEditButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    const selfLink = this.props.file._links.self as Link;
    apiClient.head(selfLink.href).then((response: Response) =>
      this.setState({
        loading: false,
        contentType: response.headers.get("Content-Type"),
        language: response.headers.get("X-Programming-Language")
      })
    );
  }

  shouldRender = () => {
    if (!this.props.file._links.modify) {
      return false;
    }
    const { loading, language, contentType } = this.state;
    if (loading) {
      return false;
    }
    return isEditable(contentType, language);
  };

  pushToEditPage() {
    const { repository, revision, file, history } = this.props;
    const url = createSourceExtensionUrl(repository, "edit", revision, file.path);
    history.push(url);
  }

  render() {
    const { t } = this.props;

    return (
      <>
        {this.shouldRender() && (
          <Button
            title={t("scm-editor-plugin.edit.tooltip")}
            className="button"
            onClick={() => this.pushToEditPage()}
            {...createAttributesForTesting("edit-file-button")}
          >
            <i className="fas fa-edit" />
          </Button>
        )}
      </>
    );
  }
}

export default withRouter(withTranslation("plugins")(FileEditButton));
