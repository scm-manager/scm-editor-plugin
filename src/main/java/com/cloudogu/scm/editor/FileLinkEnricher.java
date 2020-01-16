package com.cloudogu.scm.editor;

import sonia.scm.api.v2.resources.Enrich;
import sonia.scm.api.v2.resources.HalAppender;
import sonia.scm.api.v2.resources.HalEnricher;
import sonia.scm.api.v2.resources.HalEnricherContext;
import sonia.scm.api.v2.resources.LinkBuilder;
import sonia.scm.api.v2.resources.ScmPathInfoStore;
import sonia.scm.plugin.Extension;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.FileObject;
import sonia.scm.repository.NamespaceAndName;

import javax.inject.Inject;
import javax.inject.Provider;

@Extension
@Enrich(FileObject.class)
public class FileLinkEnricher implements HalEnricher {

  private final Provider<ScmPathInfoStore> scmPathInfoStore;
  private final EditorPreconditions editorPreconditions;

  @Inject
  public FileLinkEnricher(Provider<ScmPathInfoStore> scmPathInfoStore, EditorPreconditions editorPreconditions) {
    this.scmPathInfoStore = scmPathInfoStore;
    this.editorPreconditions = editorPreconditions;
  }

  @Override
  public void enrich(HalEnricherContext context, HalAppender appender) {
    NamespaceAndName namespaceAndName = context.oneRequireByType(NamespaceAndName.class);
    BrowserResult browserResult = context.oneRequireByType(BrowserResult.class);
    FileObject fileObject = context.oneRequireByType(FileObject.class);
    if (editorPreconditions.isEditable(namespaceAndName, browserResult.getRevision(), browserResult.getRequestedRevision())) {
      appendLinks(appender, fileObject, namespaceAndName);
    }
  }

  private void appendLinks(HalAppender appender, FileObject fileObject, NamespaceAndName namespaceAndName) {
    if (fileObject.isDirectory()) {
      appendDirectoryLinks(appender, fileObject, namespaceAndName);
    } else {
      appendFileLinks(appender, fileObject, namespaceAndName);
    }
  }

  private void appendDirectoryLinks(HalAppender appender, FileObject fileObject, NamespaceAndName namespaceAndName) {
    LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), EditorResource.class);
    appender.appendLink("create", createCreateLink(fileObject, namespaceAndName, linkBuilder));
  }

  private void appendFileLinks(HalAppender appender, FileObject fileObject, NamespaceAndName namespaceAndName) {
    LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), EditorResource.class);
    appender.appendLink("modify", createModifyLink(fileObject, namespaceAndName, linkBuilder));
    appender.appendLink("delete", createDeleteLink(fileObject, namespaceAndName, linkBuilder));
  }

  private String createCreateLink(FileObject fileObject, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    return createModifyLink("create", fileObject.getPath(), namespaceAndName, linkBuilder);
  }

  private String createDeleteLink(FileObject fileObject, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    return createModifyLink("delete", fileObject.getPath(), namespaceAndName, linkBuilder);
  }

  private String createModifyLink(FileObject fileObject, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    // TODO fix strange api: modify parent?
    return createModifyLink("modify", fileObject.getParentPath(), namespaceAndName, linkBuilder);
  }

  private String createModifyLink(String method, String path, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    return linkBuilder.method(method).parameters(namespaceAndName.getNamespace(), namespaceAndName.getName(), path).href();
  }
}
