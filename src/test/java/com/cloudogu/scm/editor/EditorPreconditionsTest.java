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

import com.google.common.collect.ImmutableList;
import org.github.sdorra.jse.ShiroExtension;
import org.github.sdorra.jse.SubjectAware;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sonia.scm.repository.Branch;
import sonia.scm.repository.Branches;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.ChangesetPagingResult;
import sonia.scm.repository.FileObject;
import sonia.scm.repository.InternalRepositoryException;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Person;
import sonia.scm.repository.Repository;
import sonia.scm.repository.RepositoryTestData;
import sonia.scm.repository.api.Command;
import sonia.scm.repository.api.FileLock;
import sonia.scm.repository.api.FileLockCommandBuilder;
import sonia.scm.repository.api.LogCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import java.io.IOException;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Java6Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
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
  void shouldReturnTrueForEmptyRepositoryWithoutBranchSupport() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    BrowserResult result = createBrowserResult("abc", "master", false);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isTrue();
  }

  @Test
  void shouldReturnTrueForLatestRevisionWithoutBranchSupport() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    BrowserResult result = createBrowserResult("abc", "master", false);

    setUpLogCommandResult("abc");

    assertThat(preconditions.isEditable(namespaceAndName, result)).isTrue();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnTrueForLatestRevisionOnBranch() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.BRANCHES);
    BrowserResult result = createBrowserResult("abc", "master", false);

    setUpBranches(
      Branch.normalBranch("master", "cde"),
      Branch.defaultBranch("develop", "abc")
    );

    assertThat(preconditions.isEditable(namespaceAndName, result)).isTrue();
  }

  @Test
  void shouldReturnFalseIfNotPermitted() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.LOG, Command.BRANCHES);
    BrowserResult result = createBrowserResult("abc", "master", false);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnFalseIfModifyCommandIsNotSupported() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.LOG);
    BrowserResult result = createBrowserResult("abc", "master", false);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnFalseIfLogAndBranchesCommandAreNotSupported() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY);
    BrowserResult result = createBrowserResult("abc", "master", false);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  void shouldReturnFalseIfNotAnExistingBranch() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    FileObject fileObject = new FileObject();
    fileObject.addChild(new FileObject());
    BrowserResult result = createBrowserResult("abc", "master", false, fileObject);

    setUpLogCommandResult("def");

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnFalseIfNotABranch() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.BRANCHES);
    FileObject fileObject = new FileObject();
    fileObject.addChild(new FileObject());
    BrowserResult result = createBrowserResult("abc", "notExistingBranch", false, fileObject);

    setUpBranches(
      Branch.normalBranch("master", "cde"),
      Branch.defaultBranch("develop", "abc")
    );

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnTrueIfHasTipButEmptyRepo() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.BRANCHES);
    BrowserResult result = createBrowserResult("abc", "tip", false);
    result.getFile().setDirectory(true);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isTrue();
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnFalseIfIsNotTipButIsFile() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.BRANCHES);
    BrowserResult result = createBrowserResult("abc", "123", false);

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  @Test
  void shouldThrowInternalRepositoryExceptionOnError() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    BrowserResult result = createBrowserResult("abc", "master", false);

    LogCommandBuilder builder = repositoryService.getLogCommand().setPagingLimit(1);
    doThrow(new IOException("failed :(")).when(builder).getChangesets();

    assertThrows(InternalRepositoryException.class, () -> preconditions.isEditable(namespaceAndName, result));
  }

  @Test
  @SubjectAware(value = "trillian", permissions = "repository:push:21")
  void shouldReturnTrueIfFileLockedByMe() {
    FileLockCommandBuilder lockCommandBuilder = mock(FileLockCommandBuilder.class);
    when(repositoryService.getLockCommand()).thenReturn(lockCommandBuilder);
    lenient().when(repositoryService.isSupported(Command.FILE_LOCK)).thenReturn(true);
    when(lockCommandBuilder.status("some_file")).thenReturn(Optional.of(new FileLock("some_file", "", "trillian", Instant.now())));
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.BRANCHES);
    BrowserResult result = createBrowserResult("abc", "tip", false);
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
    BrowserResult result = createBrowserResult("abc", "tip", false);
    result.getFile().setDirectory(true);
    result.getFile().setPath("some_file");

    assertThat(preconditions.isEditable(namespaceAndName, result)).isFalse();
  }

  private BrowserResult createBrowserResult(String revision, String branchName, boolean directory, FileObject fileObject) {
    fileObject.setDirectory(directory);
    return new BrowserResult(revision, branchName, fileObject);
  }

  private BrowserResult createBrowserResult(String revision, String branchName, boolean directory) {
    FileObject fileObject = new FileObject();
    return createBrowserResult(revision, branchName, directory, fileObject);
  }

  private void setUpBranches(Branch... branches) throws IOException {
    when(repositoryService.getBranchesCommand().getBranches()).thenReturn(new Branches(branches));
  }

  private void setUpLogCommandResult(String changesetId) throws IOException {
    Changeset changeset = new Changeset(changesetId, new Date().getTime(), new Person("Arthur Dent"));
    ChangesetPagingResult result = new ChangesetPagingResult(1, ImmutableList.of(changeset));
    when(repositoryService.getLogCommand().setPagingLimit(1).getChangesets()).thenReturn(result);
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
