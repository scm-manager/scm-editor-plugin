package com.cloudogu.scm.editor;

import sonia.scm.repository.NamespaceAndName;

import javax.inject.Inject;
import java.util.Collection;
import java.util.Set;

import static com.cloudogu.scm.editor.ChangeGuard.Changes.changes;
import static java.util.stream.Collectors.toList;

class ChangeGuardCheck {

  private final Set<ChangeGuard> changeGuards;

  @Inject
  ChangeGuardCheck(Set<ChangeGuard> changeGuards) {
    this.changeGuards = changeGuards;
  }

  public Collection<ChangeObstacle> isDeletable(NamespaceAndName namespaceAndName, String revision, String path) {
    return changeGuards
      .stream()
      .map(guard -> guard.getObstacles(namespaceAndName, revision, changes().withFilesToDelete(path)))
      .flatMap(Collection::stream)
      .collect(toList());
  }

  public Collection<ChangeObstacle> isModifiable(NamespaceAndName namespaceAndName, String revision, String path) {
    return changeGuards
      .stream()
      .map(guard -> guard.getObstacles(namespaceAndName, revision, changes().withFilesToModify(path)))
      .flatMap(Collection::stream)
      .collect(toList());
  }

  public Collection<ChangeObstacle> isModifiableAndCreatable(NamespaceAndName namespaceAndName, String revision, Collection<String> toBeModified, Collection<String> toBeCreated) {
    return changeGuards
      .stream()
      .map(guard -> guard.getObstacles(namespaceAndName, revision, changes().withFilesToModify(toBeModified).withFilesToCreate(toBeCreated)))
      .flatMap(Collection::stream)
      .collect(toList());
  }

  public Collection<ChangeObstacle> canCreateFilesIn(NamespaceAndName namespaceAndName, String revision, String path) {
    return changeGuards
      .stream()
      .map(guard -> guard.getObstacles(namespaceAndName, revision, changes().withPathForCreate(path)))
      .flatMap(Collection::stream)
      .collect(toList());
  }
}
