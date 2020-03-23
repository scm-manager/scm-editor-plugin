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
