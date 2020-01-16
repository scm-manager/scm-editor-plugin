package com.cloudogu.scm.editor;

import com.google.inject.util.Providers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
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

import static java.util.Collections.emptyList;
import static java.util.Collections.singleton;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileLinkEnricherTest {

  final ChangeObstacle DUMMY_OBSTACLE = null;

  @Mock
  private HalEnricherContext context;

  @Mock
  private HalAppender appender;

  @Mock
  private EditorPreconditions preconditions;

  @Mock
  private ChangeGuardCheck changeGuardCheck;

  private FileLinkEnricher enricher;

  private Repository repository = RepositoryTestData.createHeartOfGold();

  @BeforeEach
  void setUpObjectUnderTest() {
    ScmPathInfoStore pathInfoStore = new ScmPathInfoStore();
    pathInfoStore.set(() -> URI.create("/"));
    enricher = new FileLinkEnricher(Providers.of(pathInfoStore), preconditions, changeGuardCheck);
  }

  @Test
  void shouldNotEnrichIfPreconditionNotMet() {
    setUpHalContext(repository, "42", true, "root");

    when(preconditions.isEditable(repository.getNamespaceAndName(), "42")).thenReturn(false);

    enricher.enrich(context, appender);

    verifyNoMoreInteractions(appender);
  }

  @Nested
  class ForEditableRepositories {

    @BeforeEach
    void whenRepositoryIsEditable() {
      when(preconditions.isEditable(repository.getNamespaceAndName(), "42")).thenReturn(true);
    }

    @Test
    void shouldEnrichWithFileLinks() {
      setUpHalContext(repository, "42", false, "readme.md");

      when(changeGuardCheck.isDeletable(repository.getNamespaceAndName(), "42", "readme.md")).thenReturn(emptyList());
      when(changeGuardCheck.isModifiable(repository.getNamespaceAndName(), "42", "readme.md")).thenReturn(emptyList());

      enricher.enrich(context, appender);

      verify(appender).appendLink(eq("modify"), eq("/v2/edit/hitchhiker/HeartOfGold/modify/"));
      verify(appender).appendLink(eq("delete"), eq("/v2/edit/hitchhiker/HeartOfGold/delete/readme.md"));
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldNotEnrichWithFileDeleteLinkWithObstacle() {
      setUpHalContext(repository, "42", false, "readme.md");

      when(changeGuardCheck.isDeletable(repository.getNamespaceAndName(), "42", "readme.md")).thenReturn(singleton(DUMMY_OBSTACLE));
      when(changeGuardCheck.isModifiable(repository.getNamespaceAndName(), "42", "readme.md")).thenReturn(emptyList());

      enricher.enrich(context, appender);

      verify(appender).appendLink(eq("modify"), eq("/v2/edit/hitchhiker/HeartOfGold/modify/"));
      verify(appender, never()).appendLink(eq("delete"), any());
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldNotEnrichWithFileModifyLinkWithObstacle() {
      setUpHalContext(repository, "42", false, "readme.md");

      when(changeGuardCheck.isDeletable(repository.getNamespaceAndName(), "42", "readme.md")).thenReturn(emptyList());
      when(changeGuardCheck.isModifiable(repository.getNamespaceAndName(), "42", "readme.md")).thenReturn(singleton(DUMMY_OBSTACLE));

      enricher.enrich(context, appender);

      verify(appender, never()).appendLink(eq("modify"), any());
      verify(appender).appendLink(eq("delete"), eq("/v2/edit/hitchhiker/HeartOfGold/delete/readme.md"));
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldEnrichWithDirectoryLinks() {
      setUpHalContext(repository, "42", true, "src/path");

      when(changeGuardCheck.canCreateFilesIn(repository.getNamespaceAndName(), "42", "src/path")).thenReturn(emptyList());

      enricher.enrich(context, appender);

      verify(appender).appendLink(eq("create"), eq("/v2/edit/hitchhiker/HeartOfGold/create/src%2Fpath"));
      verifyNoMoreInteractions(appender);
    }

    @Test
    void shouldNotEnrichWithDirectoryCreateLinkWithObstacle() {
      setUpHalContext(repository, "42", true, "src/path");

      when(changeGuardCheck.canCreateFilesIn(repository.getNamespaceAndName(), "42", "src/path")).thenReturn(singleton(DUMMY_OBSTACLE));

      enricher.enrich(context, appender);

      verify(appender, never()).appendLink(eq("create"), any());
      verifyNoMoreInteractions(appender);
    }
  }

  private void setUpHalContext(Repository repository, String revision, boolean directory, String path) {
    doReturn(repository.getNamespaceAndName()).when(context).oneRequireByType(NamespaceAndName.class);
    doReturn(new BrowserResult(revision, null)).when(context).oneRequireByType(BrowserResult.class);
    FileObject fileObject = new FileObject();
    fileObject.setPath(path);
    fileObject.setDirectory(directory);
    doReturn(fileObject).when(context).oneRequireByType(FileObject.class);
  }
}
