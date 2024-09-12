/*
 * Copyright (c) 2020 - present Cloudogu GmbH
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import React, { FC, KeyboardEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { CommitAuthor } from "@scm-manager/ui-components";
import { Textarea } from "@scm-manager/ui-core";

type Props = {
  onChange: (p: string) => void;
  disabled: boolean;
  onSubmit?: () => void;
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
};

type InnerProps = Props & {
  innerRef: React.Ref<HTMLTextAreaElement>;
};

const isStringOnChange = (event: React.ChangeEvent<HTMLTextAreaElement> | string): event is string => {
  return typeof event === "string";
};

const CommitMessage: FC<InnerProps> = ({ onChange, onSubmit, disabled, innerRef, onKeyDown }) => {
  const [t] = useTranslation("plugins");
  return (
    <>
      <CommitAuthor />
      <Textarea
        placeholder={t("scm-editor-plugin.commit.placeholder")}
        onChange={event => {
          if (isStringOnChange(event)) {
            onChange(event);
          } else {
            onChange(event.target.value);
          }
        }}
        disabled={disabled}
        onSubmit={onSubmit}
        ref={innerRef}
        onKeyDown={onKeyDown}
        className="mb-3"
      />
    </>
  );
};

export default React.forwardRef<HTMLTextAreaElement, Props>((props, ref) => (
  <CommitMessage {...props} innerRef={ref} />
));
