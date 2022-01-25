/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { CommitAuthor, Textarea } from "@scm-manager/ui-components";

type Props = {
  onChange: (p: string) => void;
  disabled: boolean;
  onSubmit?: () => void;
};

type InnerProps = Props & {
  innerRef: React.Ref<HTMLTextAreaElement>;
};

const isStringOnChange = (event: React.ChangeEvent<HTMLTextAreaElement> | string): event is string => {
  return typeof event === "string";
};

const CommitMessage: FC<InnerProps> = ({ onChange, onSubmit, disabled, innerRef }) => {
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
      />
    </>
  );
};

export default React.forwardRef<HTMLTextAreaElement, Props>((props, ref) => (
  <CommitMessage {...props} innerRef={ref} />
));
