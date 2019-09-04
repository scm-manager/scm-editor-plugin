// @flow
import { binder } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./FileDownloadIcon";
import FileDownloadButton from "./FileDownloadButton";
import FileDeleteButton from "./Delete/FileDeleteButton";

binder.bind("repos.sources.tree.row.right", FileDownloadIcon);
binder.bind("repos.sources.content.actionbar", FileDeleteButton);
binder.bind("repos.sources.content.actionbar", FileDownloadButton);
