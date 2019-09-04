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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EditorServiceTest {

  static final String SOME_PATH = "some/path";
  static final String NEW_FILE = "newFile";
  static final String NEW_COMMIT = "new ref";

  @Mock
  RepositoryServiceFactory serviceFactory;
  @Mock
  RepositoryService repositoryService;
  @Mock(answer = Answers.RETURNS_SELF)
  ModifyCommandBuilder commandBuilder;
  @Mock
  ModifyCommandBuilder.WithOverwriteFlagContentLoader contentLoader;

  EditorService editorService;

  @BeforeEach
  void initServiceFactory() {
    when(serviceFactory.create(new NamespaceAndName("space", "name")))
      .thenReturn(repositoryService);
    when(repositoryService.getModifyCommand()).thenReturn(commandBuilder);
    when(commandBuilder.createFile(anyString())).thenReturn(contentLoader);
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
  void shouldBuildCorrectModificationCommand() throws IOException {
    String newCommit = editorService
      .prepare("space", "name", "master", SOME_PATH, "new commit", "expected")
      .upload(NEW_FILE, new ByteArrayInputStream("content".getBytes()))
      .done();

    verify(contentLoader, never()).setOverwrite(true);
    verify(commandBuilder).createFile(SOME_PATH + "/" + NEW_FILE);
    verify(contentLoader).withData(any(InputStream.class));
    verify(commandBuilder).setCommitMessage("new commit");
    verify(commandBuilder).setBranch("master");
    verify(commandBuilder).setExpectedRevision("expected");
    verify(commandBuilder).execute();
    assertThat(newCommit).isEqualTo(NEW_COMMIT);
  }

  @Test
  void shouldNotStartPathOfFileWithSlash() throws IOException {
    String newCommit = editorService
      .prepare("space", "name", "master", "", "new commit", "")
      .upload(NEW_FILE, new ByteArrayInputStream("content".getBytes()))
      .done();

    verify(commandBuilder).createFile(NEW_FILE);
  }
}
