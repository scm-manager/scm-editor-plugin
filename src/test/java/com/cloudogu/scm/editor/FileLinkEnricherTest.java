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
  private final Repository repository = RepositoryTestData.createHeartOfGold();
  BrowserResult result = createBrowserResult("42", "master", false);
  @Mock
  private HalEnricherContext context;
  @Mock
  private HalAppender appender;
  @Mock
  private EditorPreconditions preconditions;
  @Mock
  private ChangeGuardCheck changeGuardCheck;
  private FileLinkEnricher enricher;

  @BeforeEach
  void setUpObjectUnderTest() {
    ScmPathInfoStore pathInfoStore = new ScmPathInfoStore();
    pathInfoStore.set(() -> URI.create("/"));
    enricher = new FileLinkEnricher(Providers.of(pathInfoStore), preconditions, changeGuardCheck);
  }

  @Test
  void shouldNotEnrichIfPreconditionNotMet() {
    setUpHalContext(repository, true, "root");

    when(preconditions.isEditable(repository.getNamespaceAndName(), result)).thenReturn(false);

    enricher.enrich(context, appender);

    verifyNoMoreInteractions(appender);
  }

  private BrowserResult createBrowserResult(String revision, String branchName, boolean directory) {
    FileObject fileObject = new FileObject();
    fileObject.setDirectory(directory);
    return new BrowserResult(revision, branchName, fileObject);
  }

  private void setUpHalContext(Repository repository, boolean directory, String path) {
    doReturn(repository.getNamespaceAndName()).when(context).oneRequireByType(NamespaceAndName.class);
    doReturn(result).when(context).oneRequireByType(BrowserResult.class);
    FileObject fileObject = new FileObject();
    fileObject.setPath(path);
    fileObject.setDirectory(directory);
    doReturn(fileObject).when(context).oneRequireByType(FileObject.class);
  }

  @Nested
  class ForEditableRepositories {
    @BeforeEach
    void whenRepositoryIsEditable() {
      when(preconditions.isEditable(repository.getNamespaceAndName(), result)).thenReturn(true);
    }

    @Test
    void shouldEnrichWithFileLinks() {
      setUpHalContext(repository, false, "readme.md");

      when(changeGuardCheck.isDeletable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(emptyList());
      when(changeGuardCheck.isModifiable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(emptyList());

      enricher.enrich(context, appender);

      verify(appender).appendLink(eq("modify"), eq("/v2/edit/hitchhiker/HeartOfGold/modify/"));
      verify(appender).appendLink(eq("delete"), eq("/v2/edit/hitchhiker/HeartOfGold/delete/readme.md"));
      verify(appender).appendLink(eq("move"), eq("/v2/edit/hitchhiker/HeartOfGold/move/readme.md"));
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldNotEnrichWithFileDeleteLinkWithObstacle() {
      setUpHalContext(repository, false, "readme.md");

      when(changeGuardCheck.isDeletable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(singleton(DUMMY_OBSTACLE));
      when(changeGuardCheck.isModifiable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(emptyList());

      enricher.enrich(context, appender);

      verify(appender).appendLink(eq("modify"), eq("/v2/edit/hitchhiker/HeartOfGold/modify/"));
      verify(appender, never()).appendLink(eq("delete"), any());
      verify(appender, never()).appendLink(eq("move"), any());
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldNotEnrichWithFileModifyLinkWithObstacle() {
      setUpHalContext(repository, false, "readme.md");

      when(changeGuardCheck.isDeletable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(emptyList());
      when(changeGuardCheck.isModifiable(repository.getNamespaceAndName(), "master", "readme.md")).thenReturn(singleton(DUMMY_OBSTACLE));

      enricher.enrich(context, appender);

      verify(appender, never()).appendLink(eq("modify"), any());
      verify(appender).appendLink("delete","/v2/edit/hitchhiker/HeartOfGold/delete/readme.md");
      verify(appender).appendLink("move", "/v2/edit/hitchhiker/HeartOfGold/move/readme.md");
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldEnrichWithDirectoryLinks() {
      setUpHalContext(repository, true, "src/path");

      when(changeGuardCheck.canCreateFilesIn(repository.getNamespaceAndName(), "master", "src/path")).thenReturn(emptyList());

      enricher.enrich(context, appender);

      verify(appender).appendLink("create", "/v2/edit/hitchhiker/HeartOfGold/create/src%2Fpath");
      verify(appender).appendLink("move", "/v2/edit/hitchhiker/HeartOfGold/move/src%2Fpath");
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldNotEnrichWithDirectoryCreateLinkWithObstacle() {
      setUpHalContext(repository, true, "src/path");

      when(changeGuardCheck.canCreateFilesIn(repository.getNamespaceAndName(), "master", "src/path")).thenReturn(singleton(DUMMY_OBSTACLE));

      enricher.enrich(context, appender);

      verify(appender, never()).appendLink(eq("create"), any());
      verify(appender).appendLink("move", "/v2/edit/hitchhiker/HeartOfGold/move/src%2Fpath");
      verifyNoMoreInteractions(appender);
    }
  }
}
