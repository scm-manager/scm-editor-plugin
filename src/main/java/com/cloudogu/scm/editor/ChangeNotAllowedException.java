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

import sonia.scm.ContextEntry;
import sonia.scm.ExceptionWithContext;
import sonia.scm.repository.NamespaceAndName;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

class ChangeNotAllowedException extends ExceptionWithContext {

  private final Collection<ChangeObstacle> obstacles;

  public ChangeNotAllowedException(NamespaceAndName namespaceAndName, String branch, String path, Collection<ChangeObstacle> obstacles) {
    super(createContext(namespaceAndName, branch, path), buildMessage(obstacles));
    this.obstacles = obstacles;
  }

  private static List<ContextEntry> createContext(NamespaceAndName namespaceAndName, String branch, String path) {
    ContextEntry.ContextBuilder contextBuilder = new ContextEntry.ContextBuilder();
    if (branch != null) {
      contextBuilder
        .in("Branch", branch);
    }
    return contextBuilder
      .in(namespaceAndName).build();
  }

  Collection<ChangeObstacle> getObstacles() {
    return obstacles;
  }

  private static String buildMessage(Collection<ChangeObstacle> obstacles) {
    return obstacles.stream().map(ChangeObstacle::getMessage).collect(Collectors.joining(",\n", "Change was prevented by other plugins:\n", ""));
  }

  @Override
  public String getCode() {
    return "AuRneG3vO1";
  }
}
