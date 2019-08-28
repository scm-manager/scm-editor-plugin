// @flow
import React from "react";
import { binder } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./FileDownloadIcon";
import FileDownloadButton from "./FileDownloadButton";
import UploadFileButton from "./FileUploadButton";

binder.bind("repos.sources.tree.row.right", FileDownloadIcon);
binder.bind("repos.sources.content.actionbar", FileDownloadButton);
binder.bind("repos.sources.actionbar", UploadFileButton);
