import React from "react";
import { Notification } from "@scm-manager/ui-components";

import { WithTranslation, withTranslation } from "react-i18next";

type Props = WithTranslation & {
  error: any;
};

class ObstacleErrorNotification extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    console.log("GEIL");
    return (
      <Notification type="danger">
        <div className="content">
          <p className="subtitle">{this.renderErrorName()}</p>
          <p>{this.renderErrorDescription()}</p>

          Hier kommen Steine

          <p>{this.renderViolations()}</p>
          {this.renderMetadata()}
        </div>
      </Notification>
    );
  }

  renderErrorName = () => {
    const { error, t } = this.props;
    const translation = t("errors." + error.errorCode + ".displayName");
    if (translation === error.errorCode) {
      return error.message;
    }
    return translation;
  };

  renderErrorDescription = () => {
    const { error, t } = this.props;
    const translation = t("errors." + error.errorCode + ".description");
    if (translation === error.errorCode) {
      return "";
    }
    return translation;
  };

  renderViolations = () => {
    const { error, t } = this.props;
    if (error.violations) {
      return (
        <>
          <p>
            <strong>{t("errors.violations")}</strong>
          </p>
          <ul>
            {error.violations.map((violation, index) => {
              return (
                <li key={index}>
                  <strong>{violation.path}:</strong> {violation.message}
                </li>
              );
            })}
          </ul>
        </>
      );
    }
  };

  renderMetadata = () => {
    const { error, t } = this.props;
    return (
      <>
        {this.renderContext()}
        {this.renderMoreInformationLink()}
        <div className="level is-size-7">
          <div className="left">
            {t("errors.transactionId")} {error.transactionId}
          </div>
          <div className="right">
            {t("errors.errorCode")} {error.errorCode}
          </div>
        </div>
      </>
    );
  };

  renderContext = () => {
    const { error, t } = this.props;
    if (error.context) {
      return (
        <>
          <p>
            <strong>{t("errors.context")}</strong>
          </p>
          <ul>
            {error.context.map((context, index) => {
              return (
                <li key={index}>
                  <strong>{context.type}:</strong> {context.id}
                </li>
              );
            })}
          </ul>
        </>
      );
    }
  };

  renderMoreInformationLink = () => {
    const { error, t } = this.props;
    if (error.url) {
      return (
        <p>
          {t("errors.moreInfo")}{" "}
          <a href={error.url} target="_blank">
            {error.errorCode}
          </a>
        </p>
      );
    }
  };
}

export default withTranslation("plugins")(ObstacleErrorNotification);
