/*
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
