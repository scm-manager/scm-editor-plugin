import { binder } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./Download/FileDownloadIcon";
import SourcesActionbar from "./SourcesActionbar";
import ContentActionbar from "./ContentActionbar";
import FileUpload from "./Upload/FileUpload";
import { Repository } from "@scm-manager/ui-types";
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

binder.bind("repos.sources.tree.row.right", FileDownloadIcon);
binder.bind("repos.sources.content.actionbar", ContentActionbar);
binder.bind("repos.sources.actionbar", SourcesActionbar);
binder.bind("repos.sources.extensions", FileUpload, byExtension("upload"));
binder.bind("repos.sources.extensions", FileEdit, byExtension("edit"));
binder.bind("repos.sources.extensions", FileEdit, byExtension("create"));
