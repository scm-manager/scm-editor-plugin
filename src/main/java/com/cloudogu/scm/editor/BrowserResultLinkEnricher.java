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

import sonia.scm.api.v2.resources.Enrich;
import sonia.scm.api.v2.resources.HalAppender;
import sonia.scm.api.v2.resources.HalEnricher;
import sonia.scm.api.v2.resources.HalEnricherContext;
import sonia.scm.api.v2.resources.LinkBuilder;
import sonia.scm.api.v2.resources.ScmPathInfoStore;
import sonia.scm.plugin.Extension;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.NamespaceAndName;

import javax.inject.Inject;
import javax.inject.Provider;

@Extension
@Enrich(BrowserResult.class)
public class BrowserResultLinkEnricher implements HalEnricher {

  private final Provider<ScmPathInfoStore> scmPathInfoStore;
  private final EditorPreconditions preconditions;
  private final ChangeGuardCheck changeGuardCheck;

  @Inject
  public BrowserResultLinkEnricher(Provider<ScmPathInfoStore> scmPathInfoStore, EditorPreconditions preconditions, ChangeGuardCheck changeGuardCheck) {
    this.scmPathInfoStore = scmPathInfoStore;
    this.preconditions = preconditions;
    this.changeGuardCheck = changeGuardCheck;
  }

  @Override
  public void enrich(HalEnricherContext context, HalAppender appender) {
    NamespaceAndName namespaceAndName = context.oneRequireByType(NamespaceAndName.class);
    BrowserResult browserResult = context.oneRequireByType(BrowserResult.class);
    if (isEnrichable(namespaceAndName, browserResult)) {
      LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), EditorResource.class);
      appender.appendLink("upload", createUploadLink(linkBuilder, namespaceAndName));
    }
  }

  private boolean isEnrichable(NamespaceAndName namespaceAndName, BrowserResult browserResult) {
    return preconditions.isEditable(namespaceAndName, browserResult.getRevision(), browserResult.getRequestedRevision()) && isDirectory(browserResult) &&
      changeGuardCheck.canCreateFilesIn(namespaceAndName, browserResult.getRequestedRevision(), browserResult.getFile().getPath()).isEmpty();
  }

  private boolean isDirectory(BrowserResult browserResult) {
    return browserResult.getFile().isDirectory();
  }

  private String createUploadLink(LinkBuilder linkBuilder, NamespaceAndName repository) {
    return linkBuilder.method("create")
      .parameters(repository.getNamespace(), repository.getName(), "PATH_PART")
      .href()
      .replace("PATH_PART", "{path}");
  }
}
