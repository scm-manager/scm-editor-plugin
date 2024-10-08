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

import org.apache.commons.lang.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import sonia.scm.ContextEntry;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.InternalRepositoryException;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Repository;
import sonia.scm.repository.RepositoryPermissions;
import sonia.scm.repository.api.Command;
import sonia.scm.repository.api.FileLock;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import jakarta.inject.Inject;
import java.io.IOException;
import java.util.Iterator;
import java.util.Optional;

public class EditorPreconditions {

  private static final Logger LOG = LoggerFactory.getLogger(EditorPreconditions.class);

  private final RepositoryServiceFactory repositoryServiceFactory;

  @Inject
  public EditorPreconditions(RepositoryServiceFactory repositoryServiceFactory) {
    this.repositoryServiceFactory = repositoryServiceFactory;
  }

  public boolean isEditable(NamespaceAndName namespaceAndName, BrowserResult browserResult) {
    try (RepositoryService repositoryService = repositoryServiceFactory.create(namespaceAndName)) {
      return isEditableCheck(repositoryService, browserResult);
    } catch (IOException ex) {
      throw new InternalRepositoryException(
        ContextEntry.ContextBuilder.entity(namespaceAndName),
        "could not check if the repository and revision is editable",
        ex
      );
    }
  }

  private boolean isEditableCheck(RepositoryService repositoryService, BrowserResult browserResult) throws IOException {
    return isPermitted(repositoryService.getRepository())
      && isModifySupported(repositoryService)
      && isUnlockedOrLockedByMe(repositoryService, browserResult)
      && (isHeadRevision(repositoryService, browserResult.getRevision(), browserResult.getRequestedRevision())
      || isEmptyRepository(browserResult));
  }

  private boolean isUnlockedOrLockedByMe(RepositoryService repositoryService, BrowserResult browserResult) {
    if (repositoryService.isSupported(Command.FILE_LOCK)) {
      Optional<FileLock> fileLock = repositoryService.getLockCommand().status(browserResult.getFile().getPath());
      return !fileLock.isPresent() || fileLock.get().getUserId().equals(SecurityUtils.getSubject().getPrincipal().toString());
    }
    return true;
  }

  private boolean isEmptyRepository(BrowserResult browserResult) {
    return browserResult.getFile() == null ||
      browserResult.getFile().isDirectory() &&
        StringUtils.isEmpty(browserResult.getFile().getParentPath()) &&
        browserResult.getFile().getChildren().isEmpty();
  }

  private boolean isModifySupported(RepositoryService repositoryService) {
    if (repositoryService.isSupported(Command.MODIFY)
      && (repositoryService.isSupported(Command.LOG) || repositoryService.isSupported(Command.BRANCHES))) {
      return true;
    }
    LOG.trace("repository is not editable, because the type of the repository does not support the required commands");
    return false;
  }

  private boolean isPermitted(Repository repository) {
    if (RepositoryPermissions.push(repository).isPermitted()) {
      return true;
    }
    LOG.trace("repository is not editable, because the user has not enough privileges");
    return false;
  }

  private boolean isHeadRevision(RepositoryService repositoryService, String revision, String branchName) throws IOException {
    if (repositoryService.isSupported(Command.BRANCHES)) {
      if (branchName == null) {
        return true;
      }
      return isExistingBranch(repositoryService, branchName);
    }
    return isLastRevision(repositoryService, revision);
  }

  private boolean isLastRevision(RepositoryService repositoryService, String revision) throws IOException {
    Iterator<Changeset> iterator = repositoryService.getLogCommand().setPagingLimit(1).getChangesets().iterator();
    if (iterator.hasNext()) {
      Changeset changeset = iterator.next();
      if (revision.equals(changeset.getId())) {
        return true;
      }
      LOG.trace(
        "repository is not editable, because revision {} is not the latest revision the latest is {}",
        revision,
        changeset.getId()
      );
      return false;
    }
    return true;
  }

  private boolean isExistingBranch(RepositoryService repositoryService, String branchName) throws IOException {
    if (
      repositoryService
        .getBranchesCommand()
        .getBranches()
        .getBranches()
        .stream()
        .anyMatch(b -> b.getName().equals(branchName))
    ) {
      return true;
    }
    LOG.trace("repository is not editable, because selected branch {} does not exist", branchName);
    return false;
  }
}
