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
    String requestedRevision = context.oneRequireByType(BrowserResult.class).getRequestedRevision();
    NamespaceAndName namespaceAndName = context.oneRequireByType(NamespaceAndName.class);
    try (RepositoryService service = serviceFactory.create(namespaceAndName)) {
      if (!service.isSupported(Command.MODIFY) || !service.isSupported(Command.BRANCHES)) {
        return;
      }
      try {
        if (isRequestWithBranch(requestedRevision, service)) {
          appendLinks(appender, fileObject, requestedRevision, namespaceAndName);
        }
      } catch (IOException e) {
        throw new InternalRepositoryException(entity(service.getRepository()), "could not check branches", e);
      }
    }
  }

  private void appendLinks(HalAppender appender, FileObject fileObject, String requestedRevision, NamespaceAndName namespaceAndName) {
    if (fileObject.isDirectory()) {
      appendDirectoryLinks(appender, fileObject, requestedRevision, namespaceAndName);
    } else {
      appendFileLinks(appender, fileObject, requestedRevision, namespaceAndName);
    }
  }

  private void appendDirectoryLinks(HalAppender appender, FileObject fileObject, String requestedRevision, NamespaceAndName namespaceAndName) {
    LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), EditorResource.class);
    appender.appendLink("fileUpload", createUploadLink(fileObject, requestedRevision, namespaceAndName, linkBuilder));
  }

  private void appendFileLinks(HalAppender appender, FileObject fileObject, String requestedRevision, NamespaceAndName namespaceAndName) {
    LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), EditorResource.class);
    appender.appendLink("delete", createDeleteLink(fileObject, requestedRevision, namespaceAndName, linkBuilder));
  }

  private boolean isRequestWithBranch(String requestedRevision, RepositoryService service) throws IOException {
    return service
      .getBranchesCommand()
      .getBranches()
      .getBranches()
      .stream()
      .anyMatch(b -> b.getName().equals(requestedRevision));
  }

  @VisibleForTesting
  String createUploadLink(FileObject fileObject, String requestedRevision, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    return linkBuilder.method("create").parameters(namespaceAndName.getNamespace(), namespaceAndName.getName(), fileObject.getPath()).href();
  }

  @VisibleForTesting
  String createDeleteLink(FileObject fileObject, String requestedRevision, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
    return linkBuilder.method("delete").parameters(namespaceAndName.getNamespace(), namespaceAndName.getName(), fileObject.getPath()).href();
  }
}
