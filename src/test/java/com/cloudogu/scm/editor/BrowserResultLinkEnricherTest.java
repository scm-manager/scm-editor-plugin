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

import static java.util.Collections.singleton;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BrowserResultLinkEnricherTest {

  @Mock
  private HalEnricherContext context;

  @Mock
  private EditorPreconditions preconditions;

  @Mock
  private HalAppender appender;

  @Mock
  private ChangeGuardCheck changeGuardCheck;

  private BrowserResultLinkEnricher enricher;

  @BeforeEach
  void setUpObjectUnderTest() {
    ScmPathInfoStore pathInfoStore = new ScmPathInfoStore();
    pathInfoStore.set(() -> URI.create("/"));
    enricher = new BrowserResultLinkEnricher(Providers.of(pathInfoStore), preconditions, changeGuardCheck);
  }

  @Test
  void shouldNotEnrichIfPreconditionNotMet() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", "master", true);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), result)).thenReturn(false);

    enricher.enrich(context, appender);

    verify(appender, never()).appendLink(anyString(), anyString());
  }

  @Test
  void shouldNotEnrichIfGuardFails() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", "master", true);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), result)).thenReturn(true);
    when(changeGuardCheck.canCreateFilesIn(repository.getNamespaceAndName(), "master", null)).thenReturn(singleton(null));

    enricher.enrich(context, appender);

    verify(appender, never()).appendLink(anyString(), anyString());
  }

  @Test
  void shouldNotEnrichBrowserResultIsNotADirectory() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", "master", false);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), result)).thenReturn(false);

    enricher.enrich(context, appender);

    verify(appender, never()).appendLink(anyString(), anyString());
  }

  @Test
  void shouldAppendLinks() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", "master", true);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), result)).thenReturn(true);

    enricher.enrich(context, appender);

    verify(appender).appendLink(eq("upload"), eq("/v2/edit/hitchhiker/HeartOfGold/create/{path}"));
    verifyNoMoreInteractions(appender);
  }

  private BrowserResult createBrowserResult(String revision, String branchName, boolean directory) {
    FileObject fileObject = new FileObject();
    fileObject.setDirectory(directory);
    return new BrowserResult(revision, branchName, fileObject);
  }

  void setUpEnricherContext(Repository repository, BrowserResult result) {
    doReturn(repository.getNamespaceAndName()).when(context).oneRequireByType(NamespaceAndName.class);
    doReturn(result).when(context).oneRequireByType(BrowserResult.class);
  }
}
