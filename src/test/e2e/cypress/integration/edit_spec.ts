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
    cy.restSetUserPermissions(username, ["repository:read,pull,push:*"]);

    // Act
    const commitMessage = hri.random();
    const newContent = hri.random();

    cy.visit(`/repo/${namespace}/${name}/code/sources/main/README.md`);
    cy.get(".fa-ellipsis-v").click();
    cy.byTestId("edit-file-button").click();
    cy.wait(4000);
    cy.get("textarea.ace_text-input").type(newContent, { force: true });
    cy.get("textarea.textarea").type(commitMessage);
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
    cy.restSetUserPermissions(username, ["repository:read,pull:*"]);

    // Act
    cy.visit(`/repo/${namespace}/${name}/code/sources/main/README.md`);

    // Assert
    cy.containsNotByTestId("span", "edit-file-button");
  });
});
