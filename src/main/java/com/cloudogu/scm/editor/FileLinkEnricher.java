package com.cloudogu.scm.editor;

import com.google.common.annotations.VisibleForTesting;
import sonia.scm.api.v2.resources.Enrich;
import sonia.scm.api.v2.resources.HalAppender;
import sonia.scm.api.v2.resources.HalEnricher;
import sonia.scm.api.v2.resources.HalEnricherContext;
import sonia.scm.api.v2.resources.LinkBuilder;
import sonia.scm.api.v2.resources.ScmPathInfoStore;
import sonia.scm.plugin.Extension;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.FileObject;
import sonia.scm.repository.InternalRepositoryException;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Repository;
import sonia.scm.repository.RepositoryPermissions;
import sonia.scm.repository.api.Command;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import javax.inject.Inject;
import javax.inject.Provider;
import java.io.IOException;

import static sonia.scm.ContextEntry.ContextBuilder.entity;

@Extension
@Enrich(FileObject.class)
public class FileLinkEnricher implements HalEnricher {

  private final Provider<ScmPathInfoStore> scmPathInfoStore;
  private final RepositoryServiceFactory serviceFactory;

  @Inject
  public FileLinkEnricher(Provider<ScmPathInfoStore> scmPathInfoStore, RepositoryServiceFactory serviceFactory) {
    this.scmPathInfoStore = scmPathInfoStore;
    this.serviceFactory = serviceFactory;
  }

  @Override
  public void enrich(HalEnricherContext context, HalAppender appender) {
    FileObject fileObject = context.oneRequireByType(FileObject.class);
    NamespaceAndName namespaceAndName = context.oneRequireByType(NamespaceAndName.class);
    BrowserResult browserResult = context.oneRequireByType(BrowserResult.class);
    try (RepositoryService service = serviceFactory.create(namespaceAndName)) {
      if (RepositoryPermissions.push(service.getRepository()).isPermitted()
        && service.isSupported(Command.MODIFY)
        && Revisions.isHeadRevision(service, browserResult)) {

        appendLinks(appender, fileObject, namespaceAndName);
      }
    } catch (IOException e) {
      throw new InternalRepositoryException(entity(namespaceAndName), "could not check branches", e);
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
    appender.appendLink("createNew", createUploadLink(fileObject, namespaceAndName, linkBuilder));
  }

  private void appendFileLinks(HalAppender appender, FileObject fileObject, NamespaceAndName namespaceAndName) {
    LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), EditorResource.class);
    appender.appendLink("delete", createDeleteLink(fileObject, namespaceAndName, linkBuilder));
    appender.appendLink("modify", createModifyLink(fileObject, namespaceAndName, linkBuilder));
  }

  @VisibleForTesting
  String createUploadLink(FileObject fileObject, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    return createModifyLink("create", fileObject.getPath(), namespaceAndName, linkBuilder);
  }

  @VisibleForTesting
  String createDeleteLink(FileObject fileObject, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    return createModifyLink("delete", fileObject.getPath(), namespaceAndName, linkBuilder);
  }

  @VisibleForTesting
  String createModifyLink(FileObject fileObject, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    return createModifyLink("modify", fileObject.getParentPath(), namespaceAndName, linkBuilder);
  }

  private String createModifyLink(String method, String path, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    return linkBuilder.method(method).parameters(namespaceAndName.getNamespace(), namespaceAndName.getName(), path).href();
  }
}
