// @flow
import React from "react";
import { binder } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./Download/FileDownloadIcon";
import FileDownloadButton from "./Download/FileDownloadButton";
import FileUploadButton from "./Upload/FileUploadButton";
import EditorNavigation from "./EditorNavigation";

binder.bind("repos.sources.tree.row.right", FileDownloadIcon);
binder.bind("repos.sources.content.actionbar", FileDownloadButton);
binder.bind("repos.sources.actionbar", FileUploadButton);
binder.bind("repository.route", EditorNavigation);
