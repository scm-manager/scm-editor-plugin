/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package com.cloudogu.scm.editor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sonia.scm.ScmConstraintViolationException;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Person;
import sonia.scm.repository.Repository;
import sonia.scm.repository.api.LogCommandBuilder;
import sonia.scm.repository.api.ModifyCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;

import static java.util.Collections.emptyList;
import static java.util.Collections.singleton;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EditorServiceTest {

  final ChangeObstacle DUMMY_OBSTACLE = new ChangeObstacle() {
    @Override
    public String getMessage() {
      return "thou shall not pass";
    }

    @Override
    public String getKey() {
      return "no";
    }
  };

  static final String SOME_PATH = "some/path";
  static final String SOME_OTHER_PATH = "/other/path";
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
  @Mock
  ModifyCommandBuilder.MoveBuilder moveBuilder;
  @Mock
  ChangeGuardCheck changeGuardCheck;

  EditorService editorService;

  @BeforeEach
  void initServiceFactory() throws IOException {
    lenient().when(serviceFactory.create(new NamespaceAndName("space", "name")))
      .thenReturn(repositoryService);
    lenient().when(repositoryService.getRepository())
      .thenReturn(new Repository("1", "git", "space", "name"));
    lenient().when(repositoryService.getModifyCommand()).thenReturn(modifyCommandBuilder);
    lenient().when(repositoryService.getLogCommand()).thenReturn(logCommandBuilder);
    lenient().when(logCommandBuilder.getChangeset(any())).thenReturn(NEW_COMMIT);
    lenient().when(modifyCommandBuilder.createFile(anyString())).thenReturn(createContentLoader);
    lenient().when(modifyCommandBuilder.modifyFile(anyString())).thenReturn(modifyContentLoader);
    lenient().when(createContentLoader.setOverwrite(anyBoolean())).thenReturn(createContentLoader);
    lenient().when(changeGuardCheck.isDeletable(any(), anyString(), any())).thenReturn(emptyList());
    lenient().when(changeGuardCheck.isModifiable(any(), anyString(), any())).thenReturn(emptyList());
    lenient().when(changeGuardCheck.canCreateFilesIn(any(), anyString(), any())).thenReturn(emptyList());
  }

  @BeforeEach
  void initService() {
    editorService = new EditorService(serviceFactory, changeGuardCheck) {
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
  void shouldCreateCorrectModifyCommandAndReturnChangesetForMove() throws IOException {
    when(modifyCommandBuilder.execute()).thenReturn("1337");
    when(modifyCommandBuilder.move(SOME_PATH)).thenReturn(moveBuilder);
    when(logCommandBuilder.getChangeset("1337")).thenReturn(new Changeset("1337", new Date().getTime(), new Person("Trillian")));

    Changeset changeset = editorService.move("space", "name", "master", SOME_PATH, SOME_OTHER_PATH, "move file");

    verify(modifyCommandBuilder).setBranch("master");
    verify(modifyCommandBuilder).setCommitMessage("move file");
    verify(moveBuilder).to(SOME_OTHER_PATH);
    verify(modifyCommandBuilder).execute();
    assertThat(changeset).isNotNull();
    assertThat(changeset.getId()).isEqualTo("1337");
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
  void shouldNotDeleteWithObstacle() {
    when(changeGuardCheck.isDeletable(new NamespaceAndName("space", "name"), "master", SOME_PATH))
      .thenReturn(singleton(DUMMY_OBSTACLE));

    assertThrows(ChangeNotAllowedException.class, () ->
      editorService
      .delete("space", "name", "master", SOME_PATH, "new commit", "expected"));

    verify(modifyCommandBuilder, never()).deleteFile(SOME_PATH);
    verify(modifyCommandBuilder, never()).setCommitMessage("new commit");
    verify(modifyCommandBuilder, never()).setBranch("master");
    verify(modifyCommandBuilder, never()).setExpectedRevision("expected");
    verify(modifyCommandBuilder, never()).execute();
  }

  @Test
  void shouldNotStartPathOfFileWithSlash() throws IOException {
    editorService
      .prepare("space", "name", "master", "", "new commit", "")
      .create(NEW_FILE, new ByteArrayInputStream("content".getBytes()))
      .done();

    verify(modifyCommandBuilder).createFile(NEW_FILE);
  }

  @Test
  void shouldThrowIllegalArgumentExceptionForInvalidFilenameAndInvalidPath() {
    assertThrows(ScmConstraintViolationException.class,  () -> editorService
      .prepare("space", "name", "master", "../", "new commit", "")
      .create(NEW_FILE, new ByteArrayInputStream("content".getBytes())));
  }
}
