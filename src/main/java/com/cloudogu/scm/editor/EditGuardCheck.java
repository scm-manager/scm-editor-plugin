package com.cloudogu.scm.editor;

import sonia.scm.repository.NamespaceAndName;

import javax.inject.Inject;
import java.util.Collection;
import java.util.Set;

import static com.cloudogu.scm.editor.EditGuard.Changes.changes;

class EditGuardCheck {

  private final Set<EditGuard> editGuards;

  @Inject
  EditGuardCheck(Set<EditGuard> editGuards) {
    this.editGuards = editGuards;
  }

  public boolean isDeletable(NamespaceAndName namespaceAndName, String revision, String path) {
    return editGuards
      .stream()
      .map(guard -> guard.getObstacles(namespaceAndName, revision, changes().withFilesToDelete(path)))
      .allMatch(Collection::isEmpty);
  }

  public boolean isModifiable(NamespaceAndName namespaceAndName, String revision, String path) {
    return editGuards
      .stream()
      .map(guard -> guard.getObstacles(namespaceAndName, revision, changes().withFilesToModify(path)))
      .allMatch(Collection::isEmpty);
  }

  public boolean canCreateFilesIn(NamespaceAndName namespaceAndName, String revision, String path) {
    return editGuards
      .stream()
      .map(guard -> guard.getObstacles(namespaceAndName, revision, changes().withPathForCreate(path)))
      .allMatch(Collection::isEmpty);
  }
}
