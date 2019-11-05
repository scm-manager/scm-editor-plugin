package com.cloudogu.scm.editor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import sonia.scm.ContextEntry;
import sonia.scm.repository.Branch;
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

  boolean isEditable(NamespaceAndName namespaceAndName, String revision) {
    try (RepositoryService repositoryService = repositoryServiceFactory.create(namespaceAndName)) {
      return isEditable(repositoryService, revision);
    } catch (IOException ex) {
      throw new InternalRepositoryException(
        ContextEntry.ContextBuilder.entity(namespaceAndName),
        "could not check if the repository and revision is enrichable",
        ex
      );
    }
  }

  private boolean isEditable(RepositoryService repositoryService, String revision) throws IOException {
    return isPermitted(repositoryService.getRepository())
      && isModifySupported(repositoryService)
      && isHeadRevision(repositoryService, revision);
  }

  private boolean isModifySupported(RepositoryService repositoryService) {
    if (repositoryService.isSupported(Command.MODIFY)
      && (repositoryService.isSupported(Command.LOG) || repositoryService.isSupported(Command.BRANCHES)) ) {
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

  private boolean isHeadRevision(RepositoryService repositoryService, String revision) throws IOException {
    if (repositoryService.isSupported(Command.BRANCHES)) {
      return isLastChangesetOfBranch(repositoryService, revision);
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

  private boolean isLastChangesetOfBranch(RepositoryService repositoryService, String revision) throws IOException {
    for (Branch branch : repositoryService.getBranchesCommand().getBranches()) {
      if (revision.equals(branch.getRevision())) {
        return true;
      }
    }
    LOG.trace("repository is not editable, because revision {} is not the latest on any branch", revision);
    return false;
  }
}
