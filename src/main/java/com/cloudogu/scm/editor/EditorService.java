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

package com.cloudogu.scm.editor;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Strings;
import org.apache.commons.lang.StringUtils;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.RepositoryPermissions;
import sonia.scm.repository.api.LogCommandBuilder;
import sonia.scm.repository.api.ModifyCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;
import sonia.scm.util.ValidationUtil;

import javax.annotation.CheckForNull;
import jakarta.inject.Inject;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;

import static sonia.scm.ScmConstraintViolationException.Builder.doThrow;

public class EditorService {

  private final RepositoryServiceFactory repositoryServiceFactory;
  private final ChangeGuardCheck changeGuardCheck;

  @Inject
  public EditorService(RepositoryServiceFactory repositoryServiceFactory, ChangeGuardCheck changeGuardCheck) {
    this.repositoryServiceFactory = repositoryServiceFactory;
    this.changeGuardCheck = changeGuardCheck;
  }

  FileUploader prepare(String namespace, String name, String branch, String path, String commitMessage, String revision) {
    try (RepositoryService repositoryService = repositoryServiceFactory.create(new NamespaceAndName(namespace, name))) {
      ModifyCommandBuilder modifyCommand = initializeModifyCommandBuilder(branch, commitMessage, revision, repositoryService);
      return new FileUploader(repositoryService, modifyCommand, path, branch);
    }
  }

  Changeset move(String namespace, String repositoryName, @CheckForNull String branch, String fromPath, String toPath, String commitMessage) throws IOException {
    validatePath(fromPath, "source path");
    doThrow()
      .violation("must not be empty", "source path")
      .when(StringUtils.isEmpty(fromPath));

    validatePath(toPath, "target path");
    doThrow()
      .violation("must not be empty", "target path")
      .when(StringUtils.isEmpty(toPath));

    try (RepositoryService repositoryService = repositoryServiceFactory.create(new NamespaceAndName(namespace, repositoryName))) {
      checkWritePermission(repositoryService);

      ModifyCommandBuilder modifyCommand = repositoryService.getModifyCommand();
      if (!Strings.isNullOrEmpty(branch)) {
        modifyCommand.setBranch(branch);
      }
      modifyCommand.setCommitMessage(commitMessage);
      modifyCommand.move(fromPath).to(toPath);
      String newChangesetId = modifyCommand.execute();

      return repositoryService.getLogCommand().setBranch(branch).getChangeset(newChangesetId);
    }
  }

  Changeset delete(String namespace, String name, String branch, String path, String commitMessage, String revision) throws IOException {
    NamespaceAndName namespaceAndName = new NamespaceAndName(namespace, name);

    Collection<ChangeObstacle> obstacles = changeGuardCheck.isDeletable(namespaceAndName, branch, path);
    if (!obstacles.isEmpty()) {
      throw new ChangeNotAllowedException(namespaceAndName, branch, path, obstacles);
    }

    try (RepositoryService repositoryService = repositoryServiceFactory.create(namespaceAndName)) {
      String changesetId = initializeModifyCommandBuilder(branch, commitMessage, revision, repositoryService)
        .deleteFile(path)
        .execute();
      return repositoryService.getLogCommand().setBranch(branch).getChangeset(changesetId);
    }
  }

  private ModifyCommandBuilder initializeModifyCommandBuilder(String branch, String commitMessage, String revision, RepositoryService repositoryService) {
    checkWritePermission(repositoryService);
    ModifyCommandBuilder modifyCommand = repositoryService.getModifyCommand();
    if (!StringUtils.isEmpty(branch)) {
      modifyCommand.setBranch(branch);
    }
    if (!StringUtils.isEmpty(revision)) {
      modifyCommand.setExpectedRevision(revision);
    }
    modifyCommand.setCommitMessage(commitMessage);
    return modifyCommand;
  }

  @VisibleForTesting
  void checkWritePermission(RepositoryService repositoryService) {
    RepositoryPermissions.push(repositoryService.getRepository()).check();
  }

  public class FileUploader implements AutoCloseable {

    private final RepositoryService repositoryService;
    private final ModifyCommandBuilder modifyCommand;
    private final String path;
    private final String branch;

    private final Collection<String> createdFiles = new ArrayList<>();
    private final Collection<String> modifiedFiles = new ArrayList<>();

    private FileUploader(RepositoryService repositoryService, ModifyCommandBuilder modifyCommand, String path, String branch) {
      this.repositoryService = repositoryService;
      this.modifyCommand = modifyCommand;
      this.path = path;
      this.branch = branch;
    }

    public FileUploader create(String fileName, InputStream stream) {
      @SuppressWarnings("squid:S1075") // the path delimiter is for urls, not for os files
      String completeFileName = computeCompleteFileName(fileName);
      try {
        modifyCommand.createFile(completeFileName).setOverwrite(true).withData(stream);
      } catch (IOException e) {
        throw new UploadFailedException(fileName);
      }
      createdFiles.add(completeFileName);
      return this;
    }

    public FileUploader modify(String fileName, InputStream stream) {
      @SuppressWarnings("squid:S1075") // the path delimiter is for urls, not for os files
      String completeFileName = computeCompleteFileName(fileName);
      try {
        modifyCommand.modifyFile(completeFileName).withData(stream);
      } catch (IOException e) {
        throw new UploadFailedException(fileName);
      }
      modifiedFiles.add(completeFileName);
      return this;
    }

    private String computeCompleteFileName(String fileName) {
      validatePath(path, "path");

      if (StringUtils.isEmpty(path)) {
        return fileName;
      } else if (fileName.startsWith("/")) {
        return path + fileName;
      } else {
        return path + "/" + fileName;
      }
    }

    public Changeset done() throws IOException {
      NamespaceAndName namespaceAndName = repositoryService.getRepository().getNamespaceAndName();
      Collection<ChangeObstacle> obstacles = changeGuardCheck.isModifiableAndCreatable(namespaceAndName, branch, modifiedFiles, createdFiles);
      if (!obstacles.isEmpty()) {
        throw new ChangeNotAllowedException(namespaceAndName, branch, path, obstacles);
      }

      String changesetId = modifyCommand.execute();
      LogCommandBuilder logCommand = repositoryService.getLogCommand();
      if (!Strings.isNullOrEmpty(branch)) {
        logCommand.setBranch(branch);
      }
      return logCommand.getChangeset(changesetId);
    }

    @Override
    public void close() {
      repositoryService.close();
    }
  }

  private void validatePath(String path, String variableName) {
    doThrow()
      .violation("must not contain \"..\", \"//\", or \"\\\" and must not equal \"..\"", variableName)
      .when(!ValidationUtil.isPathValid(path));
  }
}
