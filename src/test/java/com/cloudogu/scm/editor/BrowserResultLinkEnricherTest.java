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

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BrowserResultLinkEnricherTest {

  @Mock
  private HalEnricherContext context;

  @Mock
  private EditorPreconditions preconditions;

  @Mock
  private HalAppender appender;

  private BrowserResultLinkEnricher enricher;

  @BeforeEach
  void setUpObjectUnderTest() {
    ScmPathInfoStore pathInfoStore = new ScmPathInfoStore();
    pathInfoStore.set(() -> URI.create("/"));
    enricher = new BrowserResultLinkEnricher(Providers.of(pathInfoStore), preconditions);
  }

  @Test
  void shouldNotEnrichIfPreconditionNotMet() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", true);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42")).thenReturn(false);

    enricher.enrich(context, appender);

    verify(appender, never()).appendLink(anyString(), anyString());
  }

  @Test
  void shouldNotEnrichBrowserResultIsNotADirectory() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", false);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42")).thenReturn(false);

    enricher.enrich(context, appender);

    verify(appender, never()).appendLink(anyString(), anyString());
  }

  @Test
  void shouldAppendLinks() {
    Repository repository = RepositoryTestData.createHeartOfGold();
    BrowserResult result = createBrowserResult("42", true);
    setUpEnricherContext(repository, result);

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42")).thenReturn(true);

    enricher.enrich(context, appender);

    verify(appender).appendLink(eq("upload"), eq("/v2/edit/hitchhiker/HeartOfGold/create/{path}"));
    verifyNoMoreInteractions(appender);
  }

  private BrowserResult createBrowserResult(String revision, boolean directory) {
    FileObject fileObject = new FileObject();
    fileObject.setDirectory(directory);
    return new BrowserResult(revision, fileObject);
  }

  void setUpEnricherContext(Repository repository, BrowserResult result) {
    doReturn(repository.getNamespaceAndName()).when(context).oneRequireByType(NamespaceAndName.class);
    doReturn(result).when(context).oneRequireByType(BrowserResult.class);
  }

}
