package com.cloudogu.scm.editor;

import com.google.common.collect.ImmutableList;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.ThreadContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sonia.scm.repository.Branch;
import sonia.scm.repository.Branches;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.ChangesetPagingResult;
import sonia.scm.repository.InternalRepositoryException;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Person;
import sonia.scm.repository.Repository;
import sonia.scm.repository.RepositoryTestData;
import sonia.scm.repository.api.Command;
import sonia.scm.repository.api.LogCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import java.io.IOException;
import java.util.Date;

import static org.assertj.core.api.Java6Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EditorPreconditionsTest {

  @Mock
  private RepositoryServiceFactory repositoryServiceFactory;

  @Mock(answer = Answers.RETURNS_DEEP_STUBS)
  private RepositoryService repositoryService;

  @InjectMocks
  private EditorPreconditions preconditions;

  @Mock
  private Subject subject;

  @BeforeEach
  void setUpSubject() {
    ThreadContext.bind(subject);
  }

  @AfterEach
  void tearDownSubject() {
    ThreadContext.unbindSubject();
  }

  @Test
  void shouldReturnTrueForEmptyRepositoryWithoutBranchSupport() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    setUpPermission("42", true);

    assertThat(preconditions.isEditable(namespaceAndName, "abc")).isTrue();
  }

  @Test
  void shouldReturnTrueForLatestRevisionWithoutBranchSupport() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    setUpPermission("42", true);

    setUpLogCommandResult("abc");

    assertThat(preconditions.isEditable(namespaceAndName, "abc")).isTrue();
  }

  @Test
  void shouldReturnTrueForLatestRevisionOnBranch() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.BRANCHES);
    setUpPermission("21", true);

    setUpBranches(
      Branch.normalBranch("master", "cde"),
      Branch.defaultBranch("develop", "abc")
    );

    assertThat(preconditions.isEditable(namespaceAndName, "abc")).isTrue();
  }

  @Test
  void shouldReturnFalseIfNotPermitted() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY, Command.LOG, Command.BRANCHES);
    setUpPermission("21", false);

    assertThat(preconditions.isEditable(namespaceAndName, "abc")).isFalse();
  }

  @Test
  void shouldReturnFalseIfModifyCommandIsNotSupported() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.LOG);
    setUpPermission("21", true);

    assertThat(preconditions.isEditable(namespaceAndName, "abc")).isFalse();
  }

  @Test
  void shouldReturnFalseIfLogAndBranchesCommandAreNotSupported() {
    NamespaceAndName namespaceAndName = setUpRepositoryService("21", Command.MODIFY);
    setUpPermission("21", true);

    assertThat(preconditions.isEditable(namespaceAndName, "abc")).isFalse();
  }

  @Test
  void shouldReturnFalseIfNotTheLatestRevision() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    setUpPermission("42", true);

    setUpLogCommandResult("def");

    assertThat(preconditions.isEditable(namespaceAndName, "abc")).isFalse();
  }

  @Test
  void shouldReturnFalseIfNotTheLatestRevisionOnAnyBranch() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.BRANCHES);
    setUpPermission("42", true);

    setUpBranches(
      Branch.normalBranch("master", "abc"),
      Branch.normalBranch("develop", "def")
    );

    assertThat(preconditions.isEditable(namespaceAndName, "xyz")).isFalse();
  }

  @Test
  void shouldThrowInternalRepositoryExceptionOnError() throws IOException {
    NamespaceAndName namespaceAndName = setUpRepositoryService("42", Command.MODIFY, Command.LOG);
    setUpPermission("42", true);

    LogCommandBuilder builder = repositoryService.getLogCommand().setPagingLimit(1);
    doThrow(new IOException("failed :(")).when(builder).getChangesets();

    assertThrows(InternalRepositoryException.class, () -> preconditions.isEditable(namespaceAndName, "abc"));
  }

  private void setUpBranches(Branch... branches) throws IOException {
    when(repositoryService.getBranchesCommand().getBranches()).thenReturn(new Branches(branches));
  }

  private void setUpPermission(String repositoryId, boolean permitted) {
    when(subject.isPermitted("repository:push:" + repositoryId)).thenReturn(permitted);
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
