import { binder } from "@scm-manager/ui-extensions";
import FileDownloadIcon from "./Download/FileDownloadIcon";
import EditorNavigation from "./EditorNavigation";
import SourcesActionbar from "./SourcesActionbar";
import ContentActionbar from "./ContentActionbar";

binder.bind("repos.sources.tree.row.right", FileDownloadIcon);
binder.bind("repos.sources.content.actionbar", ContentActionbar);
binder.bind("repos.sources.actionbar", SourcesActionbar);
binder.bind("repository.route", EditorNavigation);
