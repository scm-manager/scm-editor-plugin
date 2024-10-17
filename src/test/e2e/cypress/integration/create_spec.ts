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
