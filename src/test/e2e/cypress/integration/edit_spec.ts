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

import { hri } from "human-readable-ids";

describe("Edit Files", () => {
  let username: string;
  let password: string;
  let namespace: string;
  let name: string;

  beforeEach(() => {
    // Create user and login
    username = hri.random();
    password = hri.random();
    cy.restCreateUser(username, password);
    cy.restLogin(username, password);

    // Create repo
    namespace = hri.random();
    name = hri.random();
    cy.restCreateRepo("git", namespace, name, true);
  });

  it("should edit file", () => {
    // Arrange
    cy.restSetUserRepositoryRole(username, namespace, name, "WRITE");

    // Act
    const commitMessage = hri.random();
    const newContent = hri.random();

    cy.visit(`/repo/${namespace}/${name}/code/sources/main/README.md`);
    cy.byTestId("edit-file-button").click();
    cy.get("textarea.ace_text-input").type(newContent, { force: true });
    cy.get("div.control textarea.textarea").type(commitMessage);
    cy.byTestId("create-file-commit-button").click();

    // Assert
    cy.url()
      .should("include", "README.md")
      .and("include", namespace)
      .and("include", name);
    cy.contains("README.md");
    cy.contains(newContent);
  });

  it("should not show edit button when write permissions are missing", () => {
    // Arrange
    cy.restSetUserRepositoryRole(username, namespace, name, "READ");

    // Act
    cy.visit(`/repo/${namespace}/${name}/code/sources/main/README.md`);

    // Assert
    cy.containsNotByTestId("span", "edit-file-button");
  });
});
