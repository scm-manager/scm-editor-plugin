package com.cloudogu.scm.editor;

import sonia.scm.plugin.ExtensionPoint;
import sonia.scm.repository.NamespaceAndName;

import java.util.Collection;
import java.util.Optional;

import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static java.util.Collections.unmodifiableCollection;

@ExtensionPoint
public interface ChangeGuard {
  Collection<ChangeObstacle> getObstacles(NamespaceAndName namespaceAndName, String branch, Changes changes);

  class Changes {
    private Collection<String> filesToEdit = emptyList();
    private Collection<String> filesToCreate = emptyList();
    private Collection<String> filesToDelete = emptyList();
    private String pathForCreate = null;

    static Changes changes() {
      return new Changes();
    }

    private Changes() {
    }

    public Collection<String> getFilesToModify() {
      return unmodifiableCollection(filesToEdit);
    }

    public Collection<String> getFilesToCreate() {
      return unmodifiableCollection(filesToCreate);
    }

    public Collection<String> getFilesToDelete() {
      return unmodifiableCollection(filesToDelete);
    }

    public Optional<String> getPathForCreate() {
      return Optional.ofNullable(pathForCreate);
    }

    Changes withFilesToModify(String... filesToEdit) {
      return withFilesToModify(asList(filesToEdit));
    }

    Changes withFilesToModify(Collection<String> filesToEdit) {
      this.filesToEdit = filesToEdit;
      return this;
    }

    Changes withFilesToCreate(String... filesToCreate) {
      return withFilesToCreate(asList(filesToCreate));
    }

    Changes withFilesToCreate(Collection<String> filesToCreate) {
      this.filesToCreate = filesToCreate;
      return this;
    }

    Changes withFilesToDelete(String... filesToDelete) {
      this.filesToDelete = asList(filesToDelete);
      return this;
    }

    Changes withPathForCreate(String pathForCreate) {
      this.pathForCreate = pathForCreate;
      return this;
    }
  }
}
