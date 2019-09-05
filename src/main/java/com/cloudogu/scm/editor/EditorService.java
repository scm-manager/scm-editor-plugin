package com.cloudogu.scm.editor;

import com.google.common.annotations.VisibleForTesting;
import org.apache.commons.lang.StringUtils;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.RepositoryPermissions;
import sonia.scm.repository.api.ModifyCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import javax.inject.Inject;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.IOException;
import java.io.InputStream;

public class EditorService {

  private final RepositoryServiceFactory repositoryServiceFactory;

  @Inject
  public EditorService(RepositoryServiceFactory repositoryServiceFactory) {
    this.repositoryServiceFactory = repositoryServiceFactory;
  }

  FileUploader prepare(String namespace, String name, String branch, String path, String commitMessage, String revision) {
    try (RepositoryService repositoryService = repositoryServiceFactory.create(new NamespaceAndName(namespace, name))) {
      ModifyCommandBuilder modifyCommand = initializeModifyCommandBuilder(branch, commitMessage, revision, repositoryService);
      return new FileUploader(modifyCommand, path);
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
    RepositoryPermissions.modify(repositoryService.getRepository()).check();
  }

  public String delete(String namespace, String name, String branch, String path, String commitMessage, String revision) {
    try (RepositoryService repositoryService = repositoryServiceFactory.create(new NamespaceAndName(namespace, name))) {
      return initializeModifyCommandBuilder(branch, commitMessage, revision, repositoryService)
        .deleteFile(path)
        .execute();
    }
  }

  public static class FileUploader {
    private final ModifyCommandBuilder modifyCommand;
    private final String path;

    private FileUploader(ModifyCommandBuilder modifyCommand, String path) {
      this.modifyCommand = modifyCommand;
      this.path = path;
    }

    public FileUploader upload(String fileName, InputStream stream) {
      @SuppressWarnings("squid:S1075") // the path delimiter is for urls, not for os files
      String completeFileName = computeCompleteFileName(fileName);
      try {
        modifyCommand.createFile(completeFileName).withData(stream);
      } catch (IOException e) {
        throw new UploadFailedException(fileName);
      }
      return this;
    }

    private String computeCompleteFileName(String fileName) {
      if (StringUtils.isEmpty(path)) {
        return fileName;
      } else {
        return path + "/" + fileName;
      }
    }

    public String done() {
      return modifyCommand.execute();
    }
  }
}
