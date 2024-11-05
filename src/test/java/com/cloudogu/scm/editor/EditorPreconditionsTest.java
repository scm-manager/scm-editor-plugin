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

import org.github.sdorra.jse.ShiroExtension;
import org.github.sdorra.jse.SubjectAware;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.FileObject;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Repository;
import sonia.scm.repository.RepositoryTestData;
import sonia.scm.repository.api.Command;
import sonia.scm.repository.api.FileLock;
import sonia.scm.repository.api.FileLockCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Java6Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith({MockitoExtension.class, ShiroExtension.class})
@SubjectAware(value = "trillian", permissions = "repository:push:42")
class EditorPreconditionsTest {

  @Mock
  private RepositoryServiceFactory repositoryServiceFactory;

  @Mock(answer = Answers.RETURNS_DEEP_STUBS)
  private RepositoryService repositoryService;

  @InjectMocks
  private EditorPreconditions preconditions;

  @Test
  void shouldReturnTrueForModifiableBrowserResult() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    BrowserResult result = createBrowserResult("abc", "master", false, true);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isTrue();
  }

  @Test
  void shouldReturnFalseForNotModifiableBrowserResult() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    BrowserResult result = createBrowserResult("abc", "master", false, false);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  void shouldReturnFalseIfNotPermitted() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.LOG, Command.BRANCHES);
    BrowserResult result = createBrowserResult("abc", "master", false, true);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnFalseIfModifyCommandIsNotSupported() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.LOG);
    BrowserResult result = createBrowserResult("abc", "master", false, true);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnFalseIfLogAndBranchesCommandAreNotSupported() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY);
    BrowserResult result = createBrowserResult("abc", "master", false, true);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnTrueIfFileLockedByMe() {
    FileLockCommandBuilder lockCommandBuilder = mock(FileLockCommandBuilder.class);
    when(repositoryService.getLockCommand()).thenReturn(lockCommandBuilder);
    lenient().when(repositoryService.isSupported(Command.FILE_LOCK)).thenReturn(true);
    when(lockCommandBuilder.status("some_file")).thenReturn(Optional.of(new FileLock("some_file", "", "trillian", Instant.now())));
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.BRANCHES);
    BrowserResult result = createBrowserResult("abc", "tip", false, true);
    result.getFile().setDirectory(true);
    result.getFile().setPath("some_file");

    assertThat(preconditions.isEditable(namespaceAndName, result)).isTrue();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnFalseIfFileLockedNotByMe() {
    FileLockCommandBuilder lockCommandBuilder = mock(FileLockCommandBuilder.class);
    when(repositoryService.getLockCommand()).thenReturn(lockCommandBuilder);
    lenient().when(repositoryService.isSupported(Command.FILE_LOCK)).thenReturn(true);
    when(lockCommandBuilder.status("some_file")).thenReturn(Optional.of(new FileLock("some_file", "", "dent", Instant.now())));
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.BRANCHES);
    BrowserResult result = createBrowserResult("abc", "tip", false, true);
    result.getFile().setDirectory(true);
    result.getFile().setPath("some_file");

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  private BrowserResult createBrowserResult(String revision, String branchName, boolean directory, FileObject fileObject, boolean modifiable) {
    fileObject.setDirectory(directory);
    return new BrowserResult(revision, branchName, fileObject, modifiable);
  }

  private BrowserResult createBrowserResult(String revision, String branchName, boolean directory, boolean modifiable) {
    FileObject fileObject = new FileObject();
    return createBrowserResult(revision, branchName, directory, fileObject, modifiable);
  }

  private NamespaceAndName setUpRepositoryService(String repositoryId, Command... commands) {
    Repository repository = RepositoryTestData.createHeartOfGold();
    repository.setId(repositoryId);

    NamespaceAndName namespaceAndName = repository.getNamespaceAndName();

    when(repositoryService.getRepository()).thenReturn(repository);
    when(repositoryServiceFactory.create(namespaceAndName)).thenReturn(repositoryService);

    for (Command command : commands) {
      lenient().doReturn(true).when(repositoryService).isSupported(command);
    }

    return namespaceAndName;
  }
}
