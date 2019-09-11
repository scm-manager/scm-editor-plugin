// @flow
import {binder} from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./Download/FileDownloadIcon";
import FileDeleteButton from "./Delete/FileDeleteButton";
import FileDownloadButton from "./Download/FileDownloadButton";
import FileUploadButton from "./Upload/FileUploadButton";
import EditorNavigation from "./EditorNavigation";
import FileEditButton from "./Edit/FileEditButton";

binder.bind("repos.sources.tree.row.right", FileDownloadIcon);
binder.bind("repos.sources.content.actionbar", FileDeleteButton);
binder.bind("repos.sources.content.actionbar", FileEditButton);
binder.bind("repos.sources.content.actionbar", FileDownloadButton);
binder.bind("repos.sources.actionbar", FileUploadButton);
binder.bind("repository.route", EditorNavigation);
