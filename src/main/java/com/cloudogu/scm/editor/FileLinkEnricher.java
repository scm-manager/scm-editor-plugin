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
      if (service.isSupported(Command.BRANCHES)) {
        try {
          boolean isRequestWithBranch = service
            .getBranchesCommand()
            .getBranches()
            .getBranches()
            .stream()
            .anyMatch(b -> b.getName().equals(requestedRevision));
          if (isRequestWithBranch) {
            if (fileObject.isDirectory()) {
              LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), EditorResource.class);
              appender.appendLink("fileUpload", linkBuilder.method("create").parameters(namespaceAndName.getNamespace(), namespaceAndName.getName(), fileObject.getPath()).href() + "?branch=" + requestedRevision);
            } else {
              LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), EditorResource.class);
              appender.appendLink("delete", linkBuilder.method("delete").parameters(namespaceAndName.getNamespace(), namespaceAndName.getName(), fileObject.getPath()).href() + "?branch=" + requestedRevision);
            }
          }
        } catch (IOException e) {
          throw new InternalRepositoryException(entity(service.getRepository()), "could not check branches", e);
        }
      }
    }
  }
}
