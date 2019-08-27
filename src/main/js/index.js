// @flow
import React from "react";
import { binder } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./FileDownloadIcon";

binder.bind("sourceView.right", FileDownloadIcon);
binder.bind("fileView.topRight", FileDownloadIcon);
