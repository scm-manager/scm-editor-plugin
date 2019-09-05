//@flow
import React from "react";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import {FileSize, Subtitle} from "@scm-manager/ui-components";

const styles = {
  nameColumn: {
    width: "60%"
  },
  noBorderLeft: {
    "& td:first-child": {
      borderLeft: "none"
    }
  },
  marginTop: {
    marginTop: "2rem"
  }
};

type Props = {
  files: File[],
  removeFileEntry: any => void,
  disabled: boolean,
  //context props
  t: string => string,
  classes: any
};

class FileUploadTable extends React.Component<Props> {
  removeEntry = file => {
    this.props.removeFileEntry(file);
  };

  render() {
    const {t, files, classes, disabled} = this.props;

    return (
      <>
        <div className={classes.marginTop}>
          <Subtitle subtitle={t("scm-editor-plugin.upload.file.table.title")} />
        </div>
        <table
          className={classNames(
            "card-table table is-hoverable is-fullwidth",
            classes.noBorderLeft
          )}
        >
          <thead>
            <tr>
              <th className={classes.nameColumn}>
                {t("scm-editor-plugin.upload.file.name")}
              </th>
              <th className="is-hidden-mobile">{t("scm-editor-plugin.upload.file.type")}</th>
              <th className="is-hidden-mobile">{t("scm-editor-plugin.upload.file.size")}</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => {
              return (
                <tr>
                  <td className={classNames(classes.nameColumn)}>
                    {file.name}
                  </td>
                  <td className="is-hidden-mobile">{file.type}</td>
                  <td className="is-hidden-mobile">
                    <FileSize bytes={file.size}/>
                  </td>
                  <td>
                    <a onClick={() => !disabled && this.removeEntry(file)}>
                      <i className="fas fa-trash-alt" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  }
}

export default injectSheet(styles)(translate("plugins")(FileUploadTable));
