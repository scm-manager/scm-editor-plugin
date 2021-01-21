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

// @ts-ignore
export * from "@scm-manager/integration-test-runner/steps";
// @ts-ignore
import {hri} from "human-readable-ids";

When("User deletes file", function () {
  const newFileCommitMessage = hri.random();

  cy.visit(`/repo/${this.repository.namespace}/${this.repository.name}/code/sources/main/README.md`);
  cy.byTestId("delete-file-button").click();
  cy.get("div.control textarea.textarea").type(newFileCommitMessage);
  cy.byTestId("delete-file-commit-button").click();
  cy.wait(500);
});

When("User visits code view of a file in repository", function() {
  cy.visit(`/repo/${this.repository.namespace}/${this.repository.name}/code/sources/main/README.md`);
});

When("User creates a new file", function () {
  const that = this;
  cy.fixture("foo.txt").then(function (newFileContent) {
    const newFilePath = "foo/bar";
    const newFileName = hri.random();
    const newFileCommitMessage = hri.random();

    cy.visit(`/repo/${that.repository.namespace}/${that.repository.name}/code/sourceext/create/main`);
    cy.byTestId("create-file-path-input").type(newFilePath);
    cy.byTestId("create-file-name-input").type(newFileName);
    cy.get("textarea.ace_text-input").type(newFileContent, {force: true});
    cy.get("div.control textarea.textarea").type(newFileCommitMessage);
    cy.byTestId("create-file-commit-button").click();
    that.file = {
      path: newFilePath,
      name: newFileName,
      content: newFileContent
    }
  })
});

When("User uploads a new file", function () {
  const that = this;
  cy.fixture("foo.txt").then(function (newFileContent) {
    const newFilePath = "foo/bar";
    const newFileName = hri.random();
    const newFileCommitMessage = hri.random();
    cy.visit(`/repo/${that.repository.namespace}/${that.repository.name}/code/sourceext/upload/main`);
    cy.byTestId("create-file-path-input").type(newFilePath);
    cy.get('input[type="file"]').attachFile({
      fileContent: newFileContent,
      fileName: newFileName,
      mimeType: "text/plain",
      encoding: "utf-8"
    });
    cy.get("div.control textarea.textarea").type(newFileCommitMessage);
    cy.byTestId("upload-file-commit-button").click();
    that.file = {
      path: newFilePath,
      name: newFileName,
      content: newFileContent
    }
  });
});

When("User uploads multiple new files", function () {
  const that = this;
  cy.fixture("foo.txt").then(fileContentA => {
    cy.fixture("bar.txt").then(fileContentB => {
      const newFilePath = "foo/bar";
      const newFileCommitMessage = hri.random();
      const newFileNameA = hri.random();
      const newFileNameB = hri.random();
      cy.visit(`/repo/${that.repository.namespace}/${that.repository.name}/code/sourceext/upload/main`);
      cy.byTestId("create-file-path-input").type(newFilePath);
      cy.get('input[type="file"]')
        .attachFile({fileContent: fileContentA, fileName: newFileNameA, mimeType: "text/plain", encoding: "utf-8"})
        .attachFile({fileContent: fileContentB, fileName: newFileNameB, mimeType: "text/plain", encoding: "utf-8"});
      cy.get("div.control textarea.textarea").type(newFileCommitMessage);
      cy.byTestId("upload-file-commit-button").click();
      that.files = [
        {
          path: newFilePath,
          name: newFileNameA,
          content: fileContentA
        },
        {
          path: newFilePath,
          name: newFileNameB,
          content: fileContentB
        }
      ]
    });
  });
});

Then("The created file is displayed", function () {
  cy.url().should("include", this.file.name).and("include", this.repository.namespace).and("include", this.repository.name);
  cy.contains(this.file.name);
  cy.contains(this.file.content);
});

Then("The folder containing the uploaded file is displayed", function () {
  cy.url().should("include", this.file.path).and("include", this.repository.namespace).and("include", this.repository.name);
  cy.contains(this.file.name);
});

Then("The file does not exist anymore", function() {
  cy.contains(this.file.name).should("not.exist");
});

Then("The folder containing the uploaded files is displayed", function () {
  cy.url().should("include", this.files[0].path).and("include", this.repository.namespace).and("include", this.repository.name);
  this.files.forEach(file => cy.contains(file.name))
});

Then("There is no create file button", function () {
  cy.containsNotByTestId("span", "create-file-button");
});

Then("There is no upload file button", function () {
  cy.containsNotByTestId("span", "upload-file-button");
});

Then("There is a create file button", function () {
  cy.byTestId("create-file-button");
});

Then("There is an upload file button", function () {
  cy.byTestId("upload-file-button");
});

Then("There is a delete file button", function () {
  cy.byTestId("delete-file-button");
});

Then("There is no delete file button", function () {
  cy.containsNotByTestId("span", "delete-file-button");
});
