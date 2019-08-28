// @flow
import React from "react";
import { binder } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./FileDownloadIcon";
import FileDownloadButton from "./FileDownloadButton";

binder.bind("sourceView.right", FileDownloadIcon);
binder.bind("fileView.actionbar.right", FileDownloadButton);
