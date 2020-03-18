/**
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

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42", "master")).thenReturn(false);

    enricher.enrich(context, appender);

    verify(appender, never()).appendLink(anyString(), anyString());
  }

  @Test
  void shouldNotEnrichIfGuardFails() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", "master", true);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42", "master")).thenReturn(true);
    when(changeGuardCheck.canCreateFilesIn(repository.getNamespaceAndName(), "master", null)).thenReturn(singleton(null));

    enricher.enrich(context, appender);

    verify(appender, never()).appendLink(anyString(), anyString());
  }

  @Test
  void shouldNotEnrichBrowserResultIsNotADirectory() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", "master", false);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42", "master")).thenReturn(false);

    enricher.enrich(context, appender);

    verify(appender, never()).appendLink(anyString(), anyString());
  }

  @Test
  void shouldAppendLinks() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", "master", true);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42", "master")).thenReturn(true);

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
