package com.cloudogu.scm.editor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.api.ModifyCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EditorServiceTest {

  static final String SOME_PATH = "some/path";
  static final String NEW_FILE = "newFile";
  static final String CHANGED_FILE = "changedFile";
  static final String NEW_COMMIT = "new ref";

  @Mock
  RepositoryServiceFactory serviceFactory;
  @Mock
  RepositoryService repositoryService;
  @Mock(answer = Answers.RETURNS_SELF)
  ModifyCommandBuilder commandBuilder;
  @Mock
  ModifyCommandBuilder.WithOverwriteFlagContentLoader createContentLoader;
  @Mock
  ModifyCommandBuilder.SimpleContentLoader modifyContentLoader;

  EditorService editorService;

  @BeforeEach
  void initServiceFactory() {
    when(serviceFactory.create(new NamespaceAndName("space", "name")))
      .thenReturn(repositoryService);
    when(repositoryService.getModifyCommand()).thenReturn(commandBuilder);
    lenient().when(commandBuilder.createFile(anyString())).thenReturn(createContentLoader);
    lenient().when(commandBuilder.modifyFile(anyString())).thenReturn(modifyContentLoader);
    when(commandBuilder.execute()).thenReturn(NEW_COMMIT);
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
    String newCommit = editorService
      .prepare("space", "name", "master", SOME_PATH, "new commit", "expected")
      .create(NEW_FILE, new ByteArrayInputStream("content".getBytes()))
      .done();

    verify(createContentLoader, never()).setOverwrite(true);
    verify(commandBuilder).createFile(SOME_PATH + "/" + NEW_FILE);
    verify(createContentLoader).withData(any(InputStream.class));
    verify(commandBuilder).setCommitMessage("new commit");
    verify(commandBuilder).setBranch("master");
    verify(commandBuilder).setExpectedRevision("expected");
    verify(commandBuilder).execute();
    assertThat(newCommit).isEqualTo(NEW_COMMIT);
  }

  @Test
  void shouldBuildCorrectModificationCommandForModify() throws IOException {
    String newCommit = editorService
      .prepare("space", "name", "master", SOME_PATH, "new commit", "expected")
      .modify(CHANGED_FILE, new ByteArrayInputStream("content".getBytes()))
      .done();

    verify(commandBuilder).modifyFile(SOME_PATH + "/" + CHANGED_FILE);
    verify(modifyContentLoader).withData(any(InputStream.class));
    verify(commandBuilder).setCommitMessage("new commit");
    verify(commandBuilder).setBranch("master");
    verify(commandBuilder).setExpectedRevision("expected");
    verify(commandBuilder).execute();
    assertThat(newCommit).isEqualTo(NEW_COMMIT);
  }

  @Test
  void shouldBuildCorrectModificationCommandForDelete() {
    String newCommit = editorService
      .delete("space", "name", "master", SOME_PATH, "new commit", "expected");

    verify(commandBuilder).deleteFile(SOME_PATH);
    verify(commandBuilder).setCommitMessage("new commit");
    verify(commandBuilder).setBranch("master");
    verify(commandBuilder).setExpectedRevision("expected");
    verify(commandBuilder).execute();
    assertThat(newCommit).isEqualTo(NEW_COMMIT);
  }

  @Test
  void shouldNotStartPathOfFileWithSlash() {
    String newCommit = editorService
      .prepare("space", "name", "master", "", "new commit", "")
      .create(NEW_FILE, new ByteArrayInputStream("content".getBytes()))
      .done();

    verify(commandBuilder).createFile(NEW_FILE);
  }
}
