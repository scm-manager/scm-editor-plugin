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
