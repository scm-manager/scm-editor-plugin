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

import sonia.scm.repository.NamespaceAndName;

import jakarta.inject.Inject;
import java.util.Collection;
import java.util.Set;

import static com.cloudogu.scm.editor.ChangeGuard.Changes.changes;
import static java.util.stream.Collectors.toList;

public class ChangeGuardCheck {

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
