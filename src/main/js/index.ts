/*
 * Copyright (c) 2020 - present Cloudogu GmbH
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import { binder, extensionPoints } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./Download/FileDownloadIcon";
import SourcesActionbar from "./SourcesActionbar";
import FileUpload from "./Upload/FileUpload";
import { Link, Repository } from "@scm-manager/ui-types";
import { createAttributesForTesting } from "@scm-manager/ui-components";
import FileDeleteAction from "./Delete/FileDeleteAction";
import { isEditable } from "./Edit/isEditable";
import { FileMoveAction } from "./Move/FileMoveAction";
import { createSourceExtensionUrl } from "./links";
import { encodeFilePath } from "./Edit/encodeFilePath";
import FileEdit from "./Edit/FileEdit";

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

binder.bind<extensionPoints.FileViewActionBarOverflowMenu>(
  "repos.sources.content.actionbar.menu",
  {
    category: "Editor",
    label: "scm-editor-plugin.edit.tooltip",
    icon: "edit",
    link: props => createSourceExtensionUrl(props.repository, "edit", props.revision, encodeFilePath(props.file.path)),
    props: { ...createAttributesForTesting("edit-file-button") }
  },
  props =>
    props.file._links.modify && props.contentType && isEditable(props.contentType.type, props.contentType.language)
);
binder.bind<extensionPoints.FileViewActionBarOverflowMenu>(
  "repos.sources.content.actionbar.menu",
  {
    category: "Editor",
    label: "scm-editor-plugin.move.tooltip",
    icon: "exchange-alt",
    modalElement: FileMoveAction,
    props: { ...createAttributesForTesting("move-file-button") }
  },
  props => props.file && "move" in props.file._links
);
binder.bind<extensionPoints.FileViewActionBarOverflowMenu>("repos.sources.content.actionbar.menu", {
  category: "Editor",
  label: "scm-editor-plugin.download.tooltip",
  icon: "download",
  props: { ...createAttributesForTesting("download-file-button") },
  action: props => {
    const link = document.createElement("a");
    link.href = (props.file._links.self as Link).href;
    link.setAttribute("download", props.file.name);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }
});
binder.bind<extensionPoints.FileViewActionBarOverflowMenu>(
  "repos.sources.content.actionbar.menu",
  {
    category: "",
    label: "scm-editor-plugin.delete.tooltip",
    icon: "trash",
    modalElement: FileDeleteAction,
    props: { ...createAttributesForTesting("delete-file-button") }
  },
  props => !!props.file._links.delete
);

binder.bind("repos.sources.tree.row.right", FileDownloadIcon);
binder.bind("repos.sources.actionbar", SourcesActionbar);
binder.bind("repos.sources.empty.actionbar", SourcesActionbar);
binder.bind("repos.sources.extensions", FileUpload, byExtension("upload"));
binder.bind("repos.sources.extensions", FileEdit, byExtension("edit"));
binder.bind("repos.sources.extensions", FileEdit, byExtension("create"));
