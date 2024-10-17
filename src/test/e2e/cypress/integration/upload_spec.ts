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

describe("Upload Files", () => {
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

  it("should upload a file", () => {
    // Arrange
    cy.restSetUserPermissions(username, ["repository:read,pull,push:*"]);

    // Act
    cy.fixture("foo.txt").then(function(newFileContent) {
      const newFilePath = "foo/bar";
      const newFileName = hri.random();
      const newFileCommitMessage = hri.random();
      cy.visit(`/repo/${namespace}/${name}/code/sourceext/upload/main`);
      cy.byTestId("create-file-path-input").type(newFilePath);
      cy.get('input[type="file"]').attachFile({
        fileContent: newFileContent,
        fileName: newFileName,
        mimeType: "text/plain",
        encoding: "utf-8"
      });
      cy.get("textarea.textarea").type(newFileCommitMessage);
      cy.byTestId("upload-file-commit-button").click();

      // Assert
      cy.url()
        .should("include", newFilePath)
        .and("include", namespace)
        .and("include", name);
    });
  });

  it("should upload multiple files", () => {
    // Arrange
    cy.restSetUserPermissions(username, ["repository:read,pull,push:*"]);

    // Act
    cy.fixture("foo.txt").then(fileContentA => {
      cy.fixture("bar.txt").then(fileContentB => {
        const newFilePath = "foo/bar";
        const newFileCommitMessage = hri.random();
        const newFileNameA = hri.random();
        const newFileNameB = hri.random();
        cy.visit(`/repo/${namespace}/${name}/code/sourceext/upload/main`);
        cy.byTestId("create-file-path-input").type(newFilePath);
        cy.get('input[type="file"]')
          .attachFile({ fileContent: fileContentA, fileName: newFileNameA, mimeType: "text/plain", encoding: "utf-8" })
          .attachFile({ fileContent: fileContentB, fileName: newFileNameB, mimeType: "text/plain", encoding: "utf-8" });
        cy.get("textarea.textarea").type(newFileCommitMessage);
        cy.byTestId("upload-file-commit-button").click();

        // Assert
        cy.url()
          .should("include", newFilePath)
          .and("include", namespace)
          .and("include", name);
        [newFileNameA, newFileNameB].forEach(file => cy.contains(file));
      });
    });
  });

  it("should show upload button", () => {
    // Arrange
    cy.restSetUserPermissions(username, ["repository:read,pull,push:*"]);

    // Act
    cy.visit(`/repo/${namespace}/${name}/code/sources/main`);

    // Assert
    cy.byTestId("upload-file-button");
  });

  it("should not show upload button when write permissions are missing", () => {
    // Arrange
    cy.restSetUserPermissions(username, ["repository:read,pull:*"]);

    // Act
    cy.visit(`/repo/${namespace}/${name}/code/sources/main`);

    // Assert
    cy.containsNotByTestId("span", "upload-file-button");
  });
});
