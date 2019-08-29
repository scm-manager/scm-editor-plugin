// @flow
import React from "react";
import { binder } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./Download/FileDownloadIcon";
import FileDownloadButton from "./Download/FileDownloadButton";
import FileUploadButton from "./Upload/FileUploadButton";
import EditorNavigation from "./EditorNavigation";

binder.bind("sourceView.right", FileDownloadIcon);
binder.bind("fileView.actionbar.right", FileDownloadButton);
binder.bind("sourceView.actionbar.right", FileUploadButton);
binder.bind("repository.route", EditorNavigation);
