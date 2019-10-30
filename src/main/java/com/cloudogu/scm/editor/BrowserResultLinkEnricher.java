package com.cloudogu.scm.editor;

import sonia.scm.ContextEntry;
import sonia.scm.api.v2.resources.Enrich;
import sonia.scm.api.v2.resources.HalAppender;
import sonia.scm.api.v2.resources.HalEnricher;
import sonia.scm.api.v2.resources.HalEnricherContext;
import sonia.scm.api.v2.resources.LinkBuilder;
import sonia.scm.api.v2.resources.ScmPathInfoStore;
import sonia.scm.plugin.Extension;
import sonia.scm.repository.BrowserResult;
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

@Extension
@Enrich(BrowserResult.class)
public class BrowserResultLinkEnricher implements HalEnricher {

  private final Provider<ScmPathInfoStore> scmPathInfoStore;
  private final RepositoryServiceFactory serviceFactory;

  @Inject
  public BrowserResultLinkEnricher(Provider<ScmPathInfoStore> scmPathInfoStore, RepositoryServiceFactory serviceFactory) {
    this.scmPathInfoStore = scmPathInfoStore;
    this.serviceFactory = serviceFactory;
  }

  @Override
  public void enrich(HalEnricherContext context, HalAppender appender) {
    NamespaceAndName namespaceAndName = context.oneRequireByType(NamespaceAndName.class);
    BrowserResult browserResult = context.oneRequireByType(BrowserResult.class);
    try (RepositoryService repositoryService = serviceFactory.create(namespaceAndName)) {
      try {
        Repository repository = repositoryService.getRepository();
        if (RepositoryPermissions.push(repository).isPermitted() &&
          repositoryService.isSupported(Command.MODIFY) &&
          repositoryService.isSupported(Command.LOG) &&
          Revisions.isHeadRevision(repositoryService, browserResult) &&
          browserResult.getFile().isDirectory()) {

          LinkBuilder linkBuilder = new LinkBuilder(scmPathInfoStore.get().get(), EditorResource.class);
          appender.appendLink("fileUpload", linkBuilder.method("create").parameters(repository.getNamespace(), repository.getName(), "PATH_PART").href().replace("PATH_PART", "{path}"));
          appender.appendLink("modify", linkBuilder.method("modify").parameters(repository.getNamespace(), repository.getName(), "PATH_PART").href().replace("PATH_PART", "{path}"));
        }
      } catch (IOException e) {
        throw new InternalRepositoryException(ContextEntry.ContextBuilder.entity(namespaceAndName), "could not enrich BrowserResult", e);
      }
    }
  }
}
