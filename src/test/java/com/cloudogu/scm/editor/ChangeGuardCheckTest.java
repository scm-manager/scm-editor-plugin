package com.cloudogu.scm.editor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import sonia.scm.repository.NamespaceAndName;

import static java.util.Collections.emptySet;
import static java.util.Collections.singleton;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ChangeGuardCheckTest {

  static final NamespaceAndName NAMESPACE_AND_NAME = new NamespaceAndName("space", "X");

  @Nested
  class WithoutGuards {

    ChangeGuardCheck changeGuardCheck = new ChangeGuardCheck(emptySet());

    @Test
    void filesShouldBeDeletable() {
      assertThat(changeGuardCheck.isDeletable(NAMESPACE_AND_NAME, "42", "readme.md")).isEmpty();
    }

    @Test
    void filesShouldBeModifiable() {
      assertThat(changeGuardCheck.isModifiable(NAMESPACE_AND_NAME, "42", "readme.md")).isEmpty();
    }

    @Test
    void createShouldBePossible() {
      assertThat(changeGuardCheck.canCreateFilesIn(NAMESPACE_AND_NAME, "42", "some/path")).isEmpty();
    }
  }

  @Nested
  class WithGuard {
    ChangeGuard changeGuard = mock(ChangeGuard.class);
    ChangeGuardCheck changeGuardCheck = new ChangeGuardCheck(singleton(changeGuard));

    @BeforeEach
    void byDefaultThereAreNoObstacles() {
      when(changeGuard.getObstacles(any(), any(), any())).thenReturn(emptySet());
    }

    @Test
    void filesShouldBeDeletableWhenNotGuarded() {
      assertThat(changeGuardCheck.isDeletable(NAMESPACE_AND_NAME, "42", "readme.md")).isEmpty();
    }

    @Test
    void filesShouldNotBeDeletableWhenGuarded() {
      SimpleChangeObstacle obstacle = new SimpleChangeObstacle();
      when(changeGuard.getObstacles(eq(NAMESPACE_AND_NAME), eq("42"), argThat(changes -> changes.getFilesToDelete().contains("readme.md"))))
        .thenReturn(singleton(obstacle));

      assertThat(changeGuardCheck.isDeletable(NAMESPACE_AND_NAME, "42", "readme.md"))
        .contains(obstacle);
    }

    @Test
    void filesShouldBeModifiableWhenNotGuarded() {
      assertThat(changeGuardCheck.isModifiable(NAMESPACE_AND_NAME, "42", "readme.md")).isEmpty();
    }

    @Test
    void filesShouldNotBeModifiableWhenGuarded() {
      SimpleChangeObstacle obstacle = new SimpleChangeObstacle();
      when(changeGuard.getObstacles(eq(NAMESPACE_AND_NAME), eq("42"), argThat(changes -> changes.getFilesToModify().contains("readme.md"))))
        .thenReturn(singleton(obstacle));

      assertThat(changeGuardCheck.isModifiable(NAMESPACE_AND_NAME, "42", "readme.md"))
        .contains(obstacle);
    }

    @Test
    void createShouldBePossibleWhenPathNotGuarded() {
      assertThat(changeGuardCheck.canCreateFilesIn(NAMESPACE_AND_NAME, "42", "some/path")).isEmpty();
    }

    @Test
    void createShouldNotBePossibleWhenPathGuarded() {
      SimpleChangeObstacle obstacle = new SimpleChangeObstacle();
      when(changeGuard.getObstacles(eq(NAMESPACE_AND_NAME), eq("42"), argThat(changes -> changes.getPathForCreate().get().equals("some/path"))))
        .thenReturn(singleton(obstacle));

      assertThat(changeGuardCheck.canCreateFilesIn(NAMESPACE_AND_NAME, "42", "some/path"))
        .contains(obstacle);
    }
  }

  private static class SimpleChangeObstacle implements ChangeObstacle {
    @Override
    public String getMessage() {
      return null;
    }

    @Override
    public String getKey() {
      return "no";
    }
  }
}
