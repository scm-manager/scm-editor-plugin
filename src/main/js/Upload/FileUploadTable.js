//@flow
import React from "react";
import {translate} from "react-i18next";


type Props = {
  files: File[],
  removeFile: any => void,
  //context props
  t: string => string
};

class FileUploadTable extends React.Component<Props> {

  removeEntry = (file) => {
    this.props.removeFileEntry(file);
  };

  humanFileSize(bytes) {
    let thresh = 1000;
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
    let units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  }

  render() {
    const {t, files} = this.props;

    return (
      <table className="card-table table is-hoverable is-fullwidth">
        <thead>
        <tr>
          <th>{t("scm-editor-plugin.upload.file.name")}</th>
          <th>{t("scm-editor-plugin.upload.file.type")}</th>
          <th>{t("scm-editor-plugin.upload.file.size")}</th>
        </tr>
        </thead>
        <tbody>
        {files.map((file) => {
          return (
            <tr>
              <td>{file.name}</td>
              <td>{file.type}</td>
              <td>{this.humanFileSize(file.size)}</td>
              <td>
                <a onClick={() => this.removeEntry(file)}>
                  <i className="fas fa-trash-alt"/>
                </a>
              </td>
            </tr>
          )
        })}
        </tbody>
      </table>
    );
  }
}

export default translate("plugins")(FileUploadTable);
