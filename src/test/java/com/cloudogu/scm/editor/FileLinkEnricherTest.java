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

import com.google.inject.util.Providers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sonia.scm.api.v2.resources.HalAppender;
import sonia.scm.api.v2.resources.HalEnricherContext;
import sonia.scm.api.v2.resources.ScmPathInfoStore;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.FileObject;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Repository;
import sonia.scm.repository.RepositoryTestData;

import java.net.URI;

import static java.util.Collections.emptyList;
import static java.util.Collections.singleton;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileLinkEnricherTest {

  final ChangeObstacle DUMMY_OBSTACLE = null;

  @Mock
  private HalEnricherContext context;

  @Mock
  private HalAppender appender;

  @Mock
  private EditorPreconditions preconditions;

  @Mock
  private ChangeGuardCheck changeGuardCheck;

  private FileLinkEnricher enricher;

  private Repository repository = RepositoryTestData.createHeartOfGold();

  @BeforeEach
  void setUpObjectUnderTest() {
    ScmPathInfoStore pathInfoStore = new ScmPathInfoStore();
    pathInfoStore.set(() -> URI.create("/"));
    enricher = new FileLinkEnricher(Providers.of(pathInfoStore), preconditions, changeGuardCheck);
  }

  @Test
  void shouldNotEnrichIfPreconditionNotMet() {
    setUpHalContext(repository, "42", "master", true, "root");

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42", "master")).thenReturn(false);

    enricher.enrich(context, appender);

    verifyNoMoreInteractions(appender);
  }

  @Nested
  class ForEditableRepositories {

    @BeforeEach
    void whenRepositoryIsEditable() {
      when(preconditions.isEditable(repository.getNamespaceAndName(), "42", "master")).thenReturn(true);
    }

    @Test
    void shouldEnrichWithFileLinks() {
      setUpHalContext(repository, "42", "master", false, "readme.md");

      when(changeGuardCheck.isDeletable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(emptyList());
      when(changeGuardCheck.isModifiable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(emptyList());

      enricher.enrich(context, appender);

      verify(appender).appendLink(eq("modify"), eq("/v2/edit/hitchhiker/HeartOfGold/modify/"));
      verify(appender).appendLink(eq("delete"), eq("/v2/edit/hitchhiker/HeartOfGold/delete/readme.md"));
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldNotEnrichWithFileDeleteLinkWithObstacle() {
      setUpHalContext(repository, "42", "master", false, "readme.md");

      when(changeGuardCheck.isDeletable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(singleton(DUMMY_OBSTACLE));
      when(changeGuardCheck.isModifiable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(emptyList());

      enricher.enrich(context, appender);

      verify(appender).appendLink(eq("modify"), eq("/v2/edit/hitchhiker/HeartOfGold/modify/"));
      verify(appender, never()).appendLink(eq("delete"), any());
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldNotEnrichWithFileModifyLinkWithObstacle() {
      setUpHalContext(repository, "42", "master", false, "readme.md");

      when(changeGuardCheck.isDeletable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(emptyList());
      when(changeGuardCheck.isModifiable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(singleton(DUMMY_OBSTACLE));

      enricher.enrich(context, appender);

      verify(appender, never()).appendLink(eq("modify"), any());
      verify(appender).appendLink(eq("delete"), eq("/v2/edit/hitchhiker/HeartOfGold/delete/readme.md"));
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldEnrichWithDirectoryLinks() {
      setUpHalContext(repository, "42", "master", true, "src/path");

      when(changeGuardCheck.canCreateFilesIn(repository.getNamespaceAndName(), "master", "src/path")).thenReturn(emptyList());

      enricher.enrich(context, appender);

      verify(appender).appendLink(eq("create"), eq("/v2/edit/hitchhiker/HeartOfGold/create/src%2Fpath"));
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldNotEnrichWithDirectoryCreateLinkWithObstacle() {
      setUpHalContext(repository, "42", "master", true, "src/path");

      when(changeGuardCheck.canCreateFilesIn(repository.getNamespaceAndName(), "master", "src/path")).thenReturn(singleton(DUMMY_OBSTACLE));

      enricher.enrich(context, appender);

      verify(appender, never()).appendLink(eq("create"), any());
      verifyNoMoreInteractions(appender);
    }
  }

  private void setUpHalContext(Repository repository, String revision, String branchName, boolean directory, String path) {
    doReturn(repository.getNamespaceAndName()).when(context).oneRequireByType(NamespaceAndName.class);
    doReturn(new BrowserResult(revision, branchName, null)).when(context).oneRequireByType(BrowserResult.class);
    FileObject fileObject = new FileObject();
    fileObject.setPath(path);
    fileObject.setDirectory(directory);
    doReturn(fileObject).when(context).oneRequireByType(FileObject.class);
  }
}
