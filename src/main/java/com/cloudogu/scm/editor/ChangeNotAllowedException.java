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
