package com.cloudogu.scm.editor;

import org.apache.commons.io.IOUtils;
import org.jboss.resteasy.core.Dispatcher;
import org.jboss.resteasy.mock.MockDispatcherFactory;
import org.jboss.resteasy.mock.MockHttpRequest;
import org.jboss.resteasy.mock.MockHttpResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith({MockitoExtension.class})
class EditorResourceTest {

  @Mock
  EditorService service;
  @Mock
  EditorService.FileUploader fileUploader;

  @InjectMocks
  EditorResource resource;

  Dispatcher dispatcher;
  MockHttpResponse response = new MockHttpResponse();

  @BeforeEach
  void initDispatcher() {
    dispatcher = MockDispatcherFactory.createDispatcher();
    dispatcher.getProviderFactory().register(new ExceptionMessageMapper());
    dispatcher.getRegistry().addSingletonResource(resource);
  }

  @Test
  void shouldProcessCompleteRequest() throws IOException, URISyntaxException {
    when(service.prepare("space", "name", "master", "some/path", "new commit"))
      .thenReturn(fileUploader);
    when(fileUploader.done()).thenReturn("new commit ref");

    MockHttpRequest request =
      MockHttpRequest
        .post("/" + EditorResource.EDITOR_REQUESTS_PATH_V2 + "/space/name/some/path?branch=master");
    multipartRequest(request, Collections.singletonMap("newFile", new ByteArrayInputStream("content".getBytes())), "new commit");
    dispatcher.invoke(request, response);

    assertThat(response.getStatus()).isEqualTo(201);
    assertThat(response.getContentAsString()).isEqualTo("new commit ref");
    verify(fileUploader).upload(eq("newFile"), eqStreamContent("content"));
  }

  @Test
  void shouldProcessEmptyPath() throws IOException, URISyntaxException {
    when(service.prepare("space", "name", "master", "", "new commit"))
      .thenReturn(fileUploader);
    when(fileUploader.done()).thenReturn("new commit ref");

    MockHttpRequest request =
      MockHttpRequest
        .post("/" + EditorResource.EDITOR_REQUESTS_PATH_V2 + "/space/name/?branch=master");
    multipartRequest(request, Collections.singletonMap("newFile", new ByteArrayInputStream("content".getBytes())), "new commit");
    dispatcher.invoke(request, response);

    assertThat(response.getStatus()).isEqualTo(201);
    assertThat(response.getContentAsString()).isEqualTo("new commit ref");
    verify(fileUploader).upload(eq("newFile"), eqStreamContent("content"));
  }

  @Test
  void shouldFailForMissingCommitMessage() throws IOException, URISyntaxException {
    MockHttpRequest request =
      MockHttpRequest
        .post("/" + EditorResource.EDITOR_REQUESTS_PATH_V2 + "/space/name/some/path?branch=master");
    multipartRequest(request, Collections.singletonMap("newFile", new ByteArrayInputStream("content".getBytes())), null);
    dispatcher.invoke(request, response);

    assertThat(response.getStatus()).isEqualTo(400);
    assertThat(response.getContentAsString()).contains("MessageMissingException");
  }

  private InputStream eqStreamContent(String expectedContent) {
    return argThat(stream -> {
      try {
        stream.reset();
        String streamContent = IOUtils.toString(new InputStreamReader(stream, Charset.defaultCharset()));
        assertThat(streamContent).asString().isEqualTo(expectedContent);
      } catch (IOException e) {
        fail();
      }
      return true;
    });
  }

  /**
   * This method is a slightly adapted copy of Lin Zaho's gist at https://gist.github.com/lin-zhao/9985191
   */
  private MockHttpRequest multipartRequest(MockHttpRequest request, Map<String, InputStream> files, String message) throws IOException {
    String boundary = UUID.randomUUID().toString();
    request.contentType("multipart/form-data; boundary=" + boundary);

    //Make sure this is deleted in afterTest()
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    try (OutputStreamWriter formWriter = new OutputStreamWriter(buffer)) {
      formWriter.append("--").append(boundary);

      for (Map.Entry<String, InputStream> entry : files.entrySet()) {
        formWriter.append("\n");
        formWriter.append(String.format("Content-Disposition: form-data; name=\"file%s\"; filename=\"%s\"",
          entry.getKey(), entry.getKey())).append("\n");
        formWriter.append("Content-Type: application/octet-stream").append("\n\n");

        InputStream stream = entry.getValue();
        int b = stream.read();
        while (b >= 0) {
          formWriter.write(b);
          b = stream.read();
        }
        stream.close();
        formWriter.append("\n").append("--").append(boundary);
      }

      if (message != null) {
        formWriter.append("\n");
        formWriter.append("Content-Disposition: form-data; name=\"message\"").append("\n\n");
        formWriter.append(message).append("\n");
        formWriter.append("--").append(boundary);
      }

      formWriter.append("--");
      formWriter.flush();
    }
    request.setInputStream(new ByteArrayInputStream(buffer.toByteArray()));
    return request;
  }
}
