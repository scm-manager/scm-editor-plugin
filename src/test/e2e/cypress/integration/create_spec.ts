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

describe("Create Files", () => {
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

  it("should create a file", () => {
    // Arrange
    // cy.restSetUserRepositoryRole(username, namespace, name, "WRITE");
    cy.restSetUserPermissions(username, ["repository:read,pull,push:*"]);

    // Act
    cy.fixture("foo.txt").then(function(newFileContent) {
      const newFilePath = "foo/bar";
      const newFileName = hri.random();
      const newFileCommitMessage = hri.random();

      cy.visit(`/repo/${namespace}/${name}/code/sourceext/create/main`);
      cy.byTestId("create-file-path-input").type(newFilePath);
      cy.byTestId("create-file-name-input").type(newFileName);
      cy.get("textarea.ace_text-input").type(newFileContent, { force: true });
      cy.get("textarea.textarea").type(newFileCommitMessage);
      cy.byTestId("create-file-commit-button").click();

      // Assert
      cy.url()
        .should("include", newFileName)
        .and("include", namespace)
        .and("include", name);
      cy.contains(newFileName);
      cy.contains(newFileContent.trim());
    });
  });

  it("should show a create button for permitted users", () => {
    // Arrange
    // cy.restSetUserRepositoryRole(username, namespace, name, "WRITE");
    cy.restSetUserPermissions(username, ["repository:read,pull,push:*"]);

    // Act
    cy.visit(`/repo/${namespace}/${name}/code/sources/main`);

    // Assert
    cy.byTestId("create-file-button");
  });

  it("should not show create button when write permissions are missing", () => {
    // Arrange
    // cy.restSetUserRepositoryRole(username, namespace, name, "READ");
    cy.restSetUserPermissions(username, ["repository:read,pull,push:*"]);

    // Act
    cy.visit(`/repo/${namespace}/${name}/code/sources/main`);

    // Assert
    cy.containsNotByTestId("span", "create-file-button");
  });
});
