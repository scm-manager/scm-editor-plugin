package com.cloudogu.scm.editor;

import sonia.scm.repository.Branch;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.api.Command;
import sonia.scm.repository.api.RepositoryService;

import java.io.IOException;
import java.util.Iterator;

final class Revisions {

  private Revisions() {}

  static boolean isHeadRevision(RepositoryService repositoryService, BrowserResult browserResult) throws IOException {
    if (repositoryService.isSupported(Command.BRANCHES)) {
      return isLastChangesetOfBranch(repositoryService, browserResult);
    }
    return isLastRevision(repositoryService, browserResult);
  }

  private static boolean isLastRevision(RepositoryService repositoryService, BrowserResult browserResult) throws IOException {
    Iterator<Changeset> iterator = repositoryService.getLogCommand().setPagingLimit(1).getChangesets().iterator();
    if (iterator.hasNext()) {
      return browserResult.getRevision().equals(iterator.next().getId());
    }
    // repository is empty
    return true;
  }

  private static boolean isLastChangesetOfBranch(RepositoryService repositoryService, BrowserResult browserResult) throws IOException {
    for (Branch branch : repositoryService.getBranchesCommand().getBranches()) {
      if (browserResult.getRevision().equals(branch.getRevision())) {
        return true;
      }
    }
    return false;
  }

}
