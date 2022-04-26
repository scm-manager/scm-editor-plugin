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
import { binder } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./Download/FileDownloadIcon";
import SourcesActionbar from "./SourcesActionbar";
import FileUpload from "./Upload/FileUpload";
import { Repository } from "@scm-manager/ui-types";
import FileEdit from "./Edit/FileEdit";
import { createAttributesForTesting } from "@scm-manager/ui-components";
import { FileDownloadAction } from "./Download/FileDownloadAction";
import { FileEditAction } from "./Edit/FileEditAction";
import FileDeleteAction from "./Delete/FileDeleteAction";
import { isEditable } from "./Edit/isEditable";
import { FileMoveAction } from "./Move/FileMoveAction";

type ExtensionProps = {
  repository: Repository;
  extension: string;
  revision?: string;
  path?: string;
};

const byExtension = (ext: string) => {
  return (props: ExtensionProps) => {
    return props.extension === ext;
  };
};

binder.bind(
  "repos.sources.content.actionbar.menu",
  {
    category: "Editor",
    label: "scm-editor-plugin.edit.tooltip",
    icon: "edit",
    component: FileEditAction,
    props: { ...createAttributesForTesting("edit-file-button") }
  },
  props =>
    props.file._links.modify && props.contentType && isEditable(props.contentType.type, props.contentType.language)
);
binder.bind(
  "repos.sources.content.actionbar.menu",
  {
    category: "Editor",
    label: "scm-editor-plugin.move.tooltip",
    icon: "exchange-alt",
    component: FileMoveAction
  },
  props => props.file && "move" in props.file._links
);
binder.bind("repos.sources.content.actionbar.menu", {
  category: "Editor",
  label: "scm-editor-plugin.download.tooltip",
  icon: "download",
  component: FileDownloadAction
});
binder.bind(
  "repos.sources.content.actionbar.menu",
  {
    category: "",
    label: "scm-editor-plugin.delete.tooltip",
    icon: "trash",
    component: FileDeleteAction
  },
  props => !!props.file._links.delete
);

binder.bind("repos.sources.tree.row.right", FileDownloadIcon);
binder.bind("repos.sources.actionbar", SourcesActionbar);
binder.bind("repos.sources.empty.actionbar", SourcesActionbar);
binder.bind("repos.sources.extensions", FileUpload, byExtension("upload"));
binder.bind("repos.sources.extensions", FileEdit, byExtension("edit"));
binder.bind("repos.sources.extensions", FileEdit, byExtension("create"));
