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
import { File, Repository } from "@scm-manager/ui-types";
import { WithTranslation, withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { createSourceExtensionUrl } from "../links";
import { createAttributesForTesting } from "@scm-manager/ui-components";

const Button = styled.span`
  width: 50px;
  color: #33b2e8;
  &:hover {
    color: #363636;
  }
`;

type Props = WithTranslation & {
  repository: Repository;
  path?: string;
  revision?: string;
  sources: File;
};

class FileUploadButton extends React.Component<Props> {
  createUploadUrl = () => {
    const { repository, revision, path } = this.props;
    return createSourceExtensionUrl(repository, "upload", revision, path);
  };

  render() {
    const { t, sources } = this.props;

    return (
      <>
        {sources && sources._links.upload && (
          <Link to={this.createUploadUrl()}>
            <Button
              title={t("scm-editor-plugin.upload.tooltip")}
              className="button"
              {...createAttributesForTesting("upload-file-button")}
            >
              <i className="fas fa-upload" />
            </Button>
          </Link>
        )}
      </>
    );
  }
}

export default withTranslation("plugins")(FileUploadButton);
