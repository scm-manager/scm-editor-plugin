package com.cloudogu.scm.editor;

import org.apache.shiro.subject.Subject;
import org.apache.shiro.subject.support.SubjectThreadState;
import org.apache.shiro.util.ThreadContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sonia.scm.api.v2.resources.HalAppender;
import sonia.scm.api.v2.resources.HalEnricherContext;
import sonia.scm.api.v2.resources.LinkBuilder;
import sonia.scm.api.v2.resources.ScmPathInfoStore;
import sonia.scm.repository.Branch;
import sonia.scm.repository.Branches;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.FileObject;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.Repository;
import sonia.scm.repository.api.BranchesCommandBuilder;
import sonia.scm.repository.api.Command;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import javax.inject.Provider;
import java.io.IOException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileLinkEnricherTest {

  static final Repository REPOSITORY = new Repository("1", "git", "space", "X");
  static final NamespaceAndName NAMESPACE_AND_NAME = REPOSITORY.getNamespaceAndName();

  @Mock
  Provider<ScmPathInfoStore> scmPathInfoStoreProvider;
  @Mock
  ScmPathInfoStore scmPathInfoStore;
  @Mock
  RepositoryServiceFactory serviceFactory;
  @Mock
  RepositoryService service;
  @Mock
  HalEnricherContext context;
  @Mock
  HalAppender appender;

  @Mock
  BrowserResult browserResult;

  @Mock(answer = Answers.RETURNS_SELF)
  BranchesCommandBuilder branchesCommand;

  @Mock
  Subject subject;
  @InjectMocks
  SubjectThreadState subjectThreadState;

  FileLinkEnricher enricher;

  FileObject fileObject = new FileObject();

  @BeforeEach
  void initBasicMocks() {
    enricher = new FileLinkEnricher(scmPathInfoStoreProvider, serviceFactory) {
      @Override
      String createUploadLink(FileObject fileObject, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
        return "http://upload";
      }

      @Override
      String createDeleteLink(FileObject fileObject, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
        return "http://delete";
      }

      @Override
      String createModifyLink(FileObject fileObject, NamespaceAndName namespaceAndName, LinkBuilder linkBuilder) {
        return "http://modify";
      }
    };
    when(browserResult.getRequestedRevision()).thenReturn("master");
    doReturn(fileObject).when(context).oneRequireByType(FileObject.class);
    doReturn(browserResult).when(context).oneRequireByType(BrowserResult.class);
    doReturn(NAMESPACE_AND_NAME).when(context).oneRequireByType(NamespaceAndName.class);

    when(serviceFactory.create(NAMESPACE_AND_NAME)).thenReturn(service);
    lenient().when(service.getRepository()).thenReturn(REPOSITORY);
  }

  @BeforeEach
  void bindSubject() {
    subjectThreadState.bind();
    ThreadContext.bind(subject);
  }

  @AfterEach
  void unbindSubject() {
    ThreadContext.unbindSubject();
  }

  @Nested
  class WithModifyPermission {

    @BeforeEach
    void giveModifyPermission() {
      lenient().when(subject.isPermitted("repository:push:1")).thenReturn(true);
    }

    @Test
    void shouldDoNothingWhenModifyCommandIsNotSupported() {
      when(service.isSupported(Command.MODIFY)).thenReturn(false);

      enricher.enrich(context, appender);

      verify(appender, never()).appendLink(any(), any());
    }

    @Nested
    class WithModifySupport {

      @BeforeEach
      void initService() {
        doReturn(true).when(service).isSupported(Command.MODIFY);
        doReturn(true).when(service).isSupported(Command.BRANCHES);

        when(service.getBranchesCommand()).thenReturn(branchesCommand);

        lenient().when(scmPathInfoStoreProvider.get()).thenReturn(scmPathInfoStore);
      }

      @Test
      void shouldDoNothingWhenRequestIsNotForABranch() throws IOException {
        when(branchesCommand.getBranches()).thenReturn(new Branches());

        enricher.enrich(context, appender);

        verify(appender, never()).appendLink(any(), any());
      }

      @Test
      void shouldAppendLinksForDirectory() throws IOException {
        when(branchesCommand.getBranches()).thenReturn(new Branches(Branch.normalBranch("master", "123")));
        fileObject.setDirectory(true);

        enricher.enrich(context, appender);

        verify(appender).appendLink("fileUpload", "http://upload");
      }

      @Test
      void shouldAppendLinksForFile() throws IOException {
        when(branchesCommand.getBranches()).thenReturn(new Branches(Branch.normalBranch("master", "123")));
        fileObject.setDirectory(false);

        enricher.enrich(context, appender);

        verify(appender).appendLink("delete", "http://delete");
        verify(appender).appendLink("modify", "http://modify");
      }
    }
  }

  @Nested
  class WithoutModifyPermission {

    @BeforeEach
    void revokeModifyPermission() {
      when(subject.isPermitted("repository:push:1")).thenReturn(false);
    }

    @Test
    void shouldDoNothingWithoutPermission() {
      lenient().doReturn(true).when(service).isSupported(Command.MODIFY);
      lenient().doReturn(true).when(service).isSupported(Command.BRANCHES);

      enricher.enrich(context, appender);

      verify(appender, never()).appendLink(any(), any());
    }
  }
}
