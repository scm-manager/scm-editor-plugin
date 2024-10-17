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

describe("Delete Files", () => {
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

  it("should delete file", () => {
    // Arrange
    // cy.restSetUserRepositoryRole(username, namespace, name, "WRITE");
    cy.restSetUserPermissions(username, ["repository:read,pull,push:*"]);

    // Act
    cy.visit(`/repo/${namespace}/${name}/code/sources/main/README.md`);
    const newFileCommitMessage = hri.random();

    cy.visit(`/repo/${namespace}/${name}/code/sources/main/README.md`);
    cy.get(".fa-ellipsis-v").click();
    cy.byTestId("delete-file-button").click();
    cy.get("textarea.textarea").type(newFileCommitMessage);
    cy.byTestId("delete-file-commit-button").click();

    // Assert
    cy.contains("README.md").should("not.exist");
  });

  it("should not show delete button when write permissions are missing", () => {
    // Arrange
    cy.restSetUserPermissions(username, ["repository:read,pull:*"]);

    // Act
    cy.visit(`/repo/${namespace}/${name}/code/sources/main/README.txt`);

    // Assert
    cy.containsNotByTestId("span", "delete-file-button");
  });
});
