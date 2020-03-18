/**
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
package com.cloudogu.scm.editor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import sonia.scm.ContextEntry;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.InternalRepositoryException;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Repository;
import sonia.scm.repository.RepositoryPermissions;
import sonia.scm.repository.api.Command;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import javax.inject.Inject;
import java.io.IOException;
import java.util.Iterator;

class EditorPreconditions {

  private static final Logger LOG = LoggerFactory.getLogger(EditorPreconditions.class);

  private final RepositoryServiceFactory repositoryServiceFactory;

  @Inject
  public EditorPreconditions(RepositoryServiceFactory repositoryServiceFactory) {
    this.repositoryServiceFactory = repositoryServiceFactory;
  }

  boolean isEditable(NamespaceAndName namespaceAndName, String revision, String branchName) {
    try (RepositoryService repositoryService = repositoryServiceFactory.create(namespaceAndName)) {
      return isEditable(repositoryService, revision, branchName);
    } catch (IOException ex) {
      throw new InternalRepositoryException(
        ContextEntry.ContextBuilder.entity(namespaceAndName),
        "could not check if the repository and revision is enrichable",
        ex
      );
    }
  }

  private boolean isEditable(RepositoryService repositoryService, String revision, String branchName) throws IOException {
    return isPermitted(repositoryService.getRepository())
      && isModifySupported(repositoryService)
      && isHeadRevision(repositoryService, revision, branchName);
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
