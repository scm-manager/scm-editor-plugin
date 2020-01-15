package com.cloudogu.scm.editor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import sonia.scm.repository.NamespaceAndName;

import static com.cloudogu.scm.editor.EditGuard.Changes.changes;
import static java.util.Collections.emptySet;
import static java.util.Collections.singleton;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class EditGuardCheckTest {

  static final NamespaceAndName NAMESPACE_AND_NAME = new NamespaceAndName("space", "X");

  @Nested
  class WithoutGuards {

    EditGuardCheck editGuardCheck = new EditGuardCheck(emptySet());

    @Test
    void filesShouldBeDeletable() {
      assertTrue(editGuardCheck.isDeletable(NAMESPACE_AND_NAME, "42", "readme.md"));
    }

    @Test
    void filesShouldBeModifiable() {
      assertTrue(editGuardCheck.isModifiable(NAMESPACE_AND_NAME, "42", "readme.md"));
    }

    @Test
    void createShouldBePossible() {
      assertTrue(editGuardCheck.canCreateFilesIn(NAMESPACE_AND_NAME, "42", "some/path"));
    }
  }

  @Nested
  class WithGuard {
    EditGuard editGuard = mock(EditGuard.class);
    EditGuardCheck editGuardCheck = new EditGuardCheck(singleton(editGuard));

    @BeforeEach
    void byDefaultThereAreNoObstacles() {
      when(editGuard.getObstacles(any(), any(), any())).thenReturn(emptySet());
    }

    @Test
    void filesShouldBeDeletableWhenNotGuarded() {
      assertTrue(editGuardCheck.isDeletable(NAMESPACE_AND_NAME, "42", "readme.md"));
    }

    @Test
    void filesShouldNotBeDeletableWhenGuarded() {
      when(editGuard.getObstacles(eq(NAMESPACE_AND_NAME), eq("42"), argThat(changes -> changes.getFilesToDelete().contains("readme.md"))))
        .thenReturn(singleton(new SimpleEditObstacle()));

      assertFalse(editGuardCheck.isDeletable(NAMESPACE_AND_NAME, "42", "readme.md"));
    }

    @Test
    void filesShouldBeModifiableWhenNotGuarded() {
      assertTrue(editGuardCheck.isModifiable(NAMESPACE_AND_NAME, "42", "readme.md"));
    }

    @Test
    void filesShouldNotBeModifiableWhenGuarded() {
      when(editGuard.getObstacles(eq(NAMESPACE_AND_NAME), eq("42"), argThat(changes -> changes.getFilesToModify().contains("readme.md"))))
        .thenReturn(singleton(new SimpleEditObstacle()));

      assertFalse(editGuardCheck.isModifiable(NAMESPACE_AND_NAME, "42", "readme.md"));
    }

    @Test
    void createShouldBePossibleWhenPathNotGuarded() {
      assertTrue(editGuardCheck.canCreateFilesIn(NAMESPACE_AND_NAME, "42", "some/path"));
    }

    @Test
    void createShouldNotBePossibleWhenPathGuarded() {
      when(editGuard.getObstacles(eq(NAMESPACE_AND_NAME), eq("42"), argThat(changes -> changes.getPathForCreate().get().equals("some/path"))))
        .thenReturn(singleton(new SimpleEditObstacle()));

      assertFalse(editGuardCheck.canCreateFilesIn(NAMESPACE_AND_NAME, "42", "some/path"));
    }
  }

  private static class SimpleEditObstacle implements EditObstacle {
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
