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

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileLinkEnricherTest {

  @Mock
  private HalEnricherContext context;

  @Mock
  private HalAppender appender;

  @Mock
  private EditorPreconditions preconditions;

  private FileLinkEnricher enricher;

  @BeforeEach
  void setUpObjectUnderTest() {
    ScmPathInfoStore pathInfoStore = new ScmPathInfoStore();
    pathInfoStore.set(() -> URI.create("/"));
    enricher = new FileLinkEnricher(Providers.of(pathInfoStore), preconditions);
  }

  @Test
  void shouldNotEnrichIfPreconditionNotMet() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    setUpHalContext(repository, "42", "master", true, "root");

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42", "master")).thenReturn(false);

    enricher.enrich(context, appender);

    verifyNoMoreInteractions(appender);
  }

  @Test
  void shouldEnrichWithFileLinks() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    setUpHalContext(repository, "42", "master", false, "readme.md");

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42", "master")).thenReturn(true);

    enricher.enrich(context, appender);

    verify(appender).appendLink(eq("modify"), eq("/v2/edit/hitchhiker/HeartOfGold/modify/"));
    verify(appender).appendLink(eq("delete"), eq("/v2/edit/hitchhiker/HeartOfGold/delete/readme.md"));
    verifyNoMoreInteractions(appender);
  }

  @Test
  void shouldEnrichWithDirectoryLinks() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    setUpHalContext(repository, "42", "master", true, "src/path");

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42", "master")).thenReturn(true);

    enricher.enrich(context, appender);

    verify(appender).appendLink(eq("create"), eq("/v2/edit/hitchhiker/HeartOfGold/create/src%2Fpath"));
    verifyNoMoreInteractions(appender);
  }

  private void setUpHalContext(Repository repository, String revision, String branchName, boolean directory, String path) {
    doReturn(repository.getNamespaceAndName()).when(context).oneRequireByType(NamespaceAndName.class);
    doReturn(new BrowserResult(revision, branchName, null)).when(context).oneRequireByType(BrowserResult.class);
    FileObject fileObject = new FileObject();
    fileObject.setPath(path);
    fileObject.setDirectory(directory);
    doReturn(fileObject).when(context).oneRequireByType(FileObject.class);
  }
}
