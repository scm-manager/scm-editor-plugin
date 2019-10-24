package com.cloudogu.scm.editor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Person;
import sonia.scm.repository.api.LogCommandBuilder;
import sonia.scm.repository.api.ModifyCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EditorServiceTest {

  static final String SOME_PATH = "some/path";
  static final String NEW_FILE = "newFile";
  static final String CHANGED_FILE = "changedFile";
  static final Changeset NEW_COMMIT = new Changeset("1", 1L, new Person("trillian"));

  @Mock
  RepositoryServiceFactory serviceFactory;
  @Mock
  RepositoryService repositoryService;
  @Mock(answer = Answers.RETURNS_SELF)
  ModifyCommandBuilder modifyCommandBuilder;

  @Mock(answer = Answers.RETURNS_SELF)
  LogCommandBuilder logCommandBuilder;
  @Mock
  ModifyCommandBuilder.WithOverwriteFlagContentLoader createContentLoader;
  @Mock
  ModifyCommandBuilder.SimpleContentLoader modifyContentLoader;

  EditorService editorService;

  @BeforeEach
  void initServiceFactory() throws IOException {
    when(serviceFactory.create(new NamespaceAndName("space", "name")))
      .thenReturn(repositoryService);
    when(repositoryService.getModifyCommand()).thenReturn(modifyCommandBuilder);
    when(repositoryService.getLogCommand()).thenReturn(logCommandBuilder);
    lenient().when(logCommandBuilder.getChangeset(any())).thenReturn(NEW_COMMIT);
    lenient().when(modifyCommandBuilder.createFile(anyString())).thenReturn(createContentLoader);
    lenient().when(modifyCommandBuilder.modifyFile(anyString())).thenReturn(modifyContentLoader);
    lenient().when(createContentLoader.setOverwrite(anyBoolean())).thenReturn(createContentLoader);
  }

  @BeforeEach
  void initService() {
    editorService = new EditorService(serviceFactory) {
      @Override
      void checkWritePermission(RepositoryService repositoryService) {
        // suppress permission check for unit test
      }
    };
  }

  @Test
  void shouldBuildCorrectModificationCommandForCreate() throws IOException {
    Changeset newCommit = editorService
      .prepare("space", "name", "master", SOME_PATH, "new commit", "expected")
      .create(NEW_FILE, new ByteArrayInputStream("content".getBytes()))
      .done();

    verify(createContentLoader).setOverwrite(true);
    verify(modifyCommandBuilder).createFile(SOME_PATH + "/" + NEW_FILE);
    verify(createContentLoader).withData(any(InputStream.class));
    verify(modifyCommandBuilder).setCommitMessage("new commit");
    verify(modifyCommandBuilder).setBranch("master");
    verify(modifyCommandBuilder).setExpectedRevision("expected");
    verify(modifyCommandBuilder).execute();
    assertThat(newCommit).isEqualTo(NEW_COMMIT);
  }

  @Test
  void shouldBuildCorrectModificationCommandForModify() throws IOException {
    Changeset newCommit = editorService
      .prepare("space", "name", "master", SOME_PATH, "new commit", "expected")
      .modify(CHANGED_FILE, new ByteArrayInputStream("content".getBytes()))
      .done();

    verify(modifyCommandBuilder).modifyFile(SOME_PATH + "/" + CHANGED_FILE);
    verify(modifyContentLoader).withData(any(InputStream.class));
    verify(modifyCommandBuilder).setCommitMessage("new commit");
    verify(modifyCommandBuilder).setBranch("master");
    verify(modifyCommandBuilder).setExpectedRevision("expected");
    verify(modifyCommandBuilder).execute();
    assertThat(newCommit).isEqualTo(NEW_COMMIT);
  }

  @Test
  void shouldBuildCorrectModificationCommandForDelete() throws IOException {
    Changeset newCommit = editorService
      .delete("space", "name", "master", SOME_PATH, "new commit", "expected");

    verify(modifyCommandBuilder).deleteFile(SOME_PATH);
    verify(modifyCommandBuilder).setCommitMessage("new commit");
    verify(modifyCommandBuilder).setBranch("master");
    verify(modifyCommandBuilder).setExpectedRevision("expected");
    verify(modifyCommandBuilder).execute();
    assertThat(newCommit).isEqualTo(NEW_COMMIT);
  }

  @Test
  void shouldNotStartPathOfFileWithSlash() throws IOException {
    Changeset newCommit = editorService
      .prepare("space", "name", "master", "", "new commit", "")
      .create(NEW_FILE, new ByteArrayInputStream("content".getBytes()))
      .done();

    verify(modifyCommandBuilder).createFile(NEW_FILE);
  }
}
