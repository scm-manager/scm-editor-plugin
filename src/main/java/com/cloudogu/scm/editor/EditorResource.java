package com.cloudogu.scm.editor;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.StringUtils;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import sonia.scm.BadRequestException;

import javax.annotation.Nullable;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.apache.http.HttpStatus.SC_CREATED;

@Path(EditorResource.EDITOR_REQUESTS_PATH_V2)
public class EditorResource {

  static final String EDITOR_REQUESTS_PATH_V2 = "v2/edit";

  private final EditorService editorService;

  @Inject
  public EditorResource(EditorService editorService) {
    this.editorService = editorService;
  }

  /**
   * This equals {@link EditorResource#create(String, String, String, MultipartFormDataInput)} with the
   * difference, that files will be added to the root directory of the repository.
   * @see #create(String, String, String, MultipartFormDataInput)
   */
  @POST
  @Path("{namespace}/{name}/create")
  @Consumes("multipart/form-data")
  public Response createInRoot(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    MultipartFormDataInput input
  ) throws IOException {
    return create(namespace, name, "", input);
  }

  /**
   * Uploads files from a request with a multipart form. Each form data with names starting with 'file' will be
   * expected to have a content disposition header with a value for 'filename' (eg.
   * <code>Content-Disposition: form-data; name="file1"; filename="pom.xml"</code>). Additionally a form data with
   * name 'message' with the commit message is required
   * (eg. <code>Content-Disposition: form-data; name="commit"....{"commitMessage": "My message"}..</code>).
   * <br>
   * To upload two files 'resource.xml' and 'data.json' to a repository 'scmadmin/repo' on branch 'master' in folder
   * 'src/resources' with curl, you will have to call something like
   * <pre>
   * curl -v scmadmin:scmadmin \
   *   http://localhost:8081/scm/api/v2/edit/scmadmin/repo/create/src/resources \
   *   -F 'file1=@resource.xml' \
   *   -F 'file2=@data.json' \
   *   -F 'commit={"commitMessage": "Commit message", "branch": "master"}'
   * </pre>
   *
   * @param namespace The namespace of the repository.
   * @param name      The name of the repository.
   * @param path      The destination directory for the new file.
   * @param input     The form data. These will have to have parts with names starting with 'name' for the files to
   *                  upload and part with name 'commit' for the commit object.
   *                  This object encapsulates necessary specifications for the new commit:
   *                  <ul>
   *                    <li>The commit message for the new commit (this is required).</li>
   *                    <li>The branch the change should be made upon (optional). If this is omitted, the default
   *                      branch will be used.</li>
   *                    <li>The expected revision the change should be made upon (optional). If this is set, the changes
   *                      will only be applied if the revision of the branch (either the specified or the default branch)
   *                      equals the given revision. If this is not the case, a conflict (status code 409) will be
   *                      returned.</li>
   *                  </ul>
   * @throws IOException Whenever there were exceptions handling the uploaded files.
   */
  @POST
  @Path("{namespace}/{name}/create/{path: .*}")
  @Consumes("multipart/form-data")
  public Response create(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Nullable @PathParam("path") String path,
    MultipartFormDataInput input
  ) throws IOException {
    String targetRevision = processFiles(namespace, name, path, input, EditorService.FileUploader::create);
    return Response.status(SC_CREATED).entity(targetRevision).build();
  }

  /**
   * This equals {@link EditorResource#modify(String, String, String, MultipartFormDataInput)} with the
   * difference, that files will be modified in the root directory of the repository.
   * @see #create(String, String, String, MultipartFormDataInput)
   */
  @POST
  @Path("{namespace}/{name}/modify")
  @Consumes("multipart/form-data")
  public Response modifyInRoot(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    MultipartFormDataInput input
  ) throws IOException {
    return modify(namespace, name, "", input);
  }

  /**
   * Replaces existing files with content from a request with a multipart form. Each form data with names starting with
   * 'file' will be expected to have a content disposition header with a value for 'filename' (eg.
   * <code>Content-Disposition: form-data; name="file1"; filename="pom.xml"</code>). Additionally a form data with
   * name 'commit' with the commit message is required
   * (eg. <code>Content-Disposition: form-data; name="commit"....{"commitMessage": "My message"}..</code>).
   * <br>
   * To replace two files 'resource.xml' and 'data.json' in a repository 'scmadmin/repo' on branch 'master' in folder
   * 'src/resources' with curl, you will have to call something like
   * <pre>
   * curl -v scmadmin:scmadmin \
   *   http://localhost:8081/scm/api/v2/edit/scmadmin/repo/modify/src/resources\?branch\=master \
   *   -F 'file1=@resource.xml' \
   *   -F 'file2=@data.json' \
   *   -F 'commit={"commitMessage": "Commit message", "branch": "master"}'
   * </pre>
   *
   * @param namespace The namespace of the repository.
   * @param name      The name of the repository.
   * @param path      The destination directory for the new file.
   * @param input     The form data. These will have to have parts with names starting with 'name' for the files to
   *                  upload and part with name 'commit' for the commit object.
   *                  This object encapsulates necessary specifications for the new commit:
   *                  <ul>
   *                    <li>The commit message for the new commit (this is required).</li>
   *                    <li>The branch the change should be made upon (optional). If this is omitted, the default
   *                      branch will be used.</li>
   *                    <li>The expected revision the change should be made upon (optional). If this is set, the changes
   *                      will only be applied if the revision of the branch (either the specified or the default branch)
   *                      equals the given revision. If this is not the case, a conflict (status code 409) will be
   *                      returned.</li>
   *                  </ul>
   * @throws IOException Whenever there were exceptions handling the uploaded files.
   */
  @POST
  @Path("{namespace}/{name}/modify/{path: .*}")
  @Consumes("multipart/form-data")
  public Response modify(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Nullable @PathParam("path") String path,
    MultipartFormDataInput input
  ) throws IOException {
    String targetRevision = processFiles(namespace, name, path, input, EditorService.FileUploader::modify);
    return Response.status(SC_CREATED).entity(targetRevision).build();
  }

  /**
   * Deletes a file.
   *
   * @param namespace The namespace of the repository.
   * @param name      The name of the repository.
   * @param path      The path and name of the file that should be deleted.
   * @param commit    This object encapsulates necessary specifications for the new commit:
   *                  <ul>
   *                    <li>The commit message for the new commit (this is required).</li>
   *                    <li>The branch the change should be made upon (optional). If this is omitted, the default
   *                      branch will be used.</li>
   *                    <li>The expected revision the change should be made upon (optional). If this is set, the changes
   *                      will only be applied if the revision of the branch (either the specified or the default branch)
   *                      equals the given revision. If this is not the case, a conflict (status code 409) will be
   *                      returned.</li>
   *                  </ul>
   */
  @POST
  @Path("{namespace}/{name}/delete/{path: .*}")
  @Consumes("application/json")
  public Response delete(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Nullable @PathParam("path") String path,
    @Valid CommitDto commit
  ) {
    String targetRevision =
      editorService.delete(
        namespace,
        name,
        commit.getBranch(),
        path,
        commit.getCommitMessage(),
        commit.getExpectedRevision());
    return Response.status(SC_CREATED).entity(targetRevision).build();
  }

  private String processFiles(String namespace, String name, String path, MultipartFormDataInput input, UploadProcessor processor) throws IOException {
    Map<String, List<InputPart>> formParts = input.getFormDataMap();
    CommitDto commit = extractCommit(formParts.get("commit"));
    EditorService.FileUploader fileUploader =
      editorService.prepare(namespace, name, commit.getBranch(), path, commit.getCommitMessage(), commit.getExpectedRevision());
    formParts
      .entrySet()
      .stream()
      .filter(e -> e.getKey().startsWith("file"))
      .map(Map.Entry::getValue)
      .forEach(inputParts -> processFile(fileUploader, inputParts, processor));
    return fileUploader.done();
  }

  private void processFile(EditorService.FileUploader fileUploader, List<InputPart> inputParts, UploadProcessor uploadProcessor) {
    for (InputPart inputPart : inputParts) {
      String fileName = parseFileName(inputPart.getHeaders());

      try {
        InputStream stream = inputPart.getBody(InputStream.class, null);
        uploadProcessor.process(fileUploader, fileName, stream);
      } catch (IOException e) {
        throw new UploadFailedException(fileName);
      }
    }
  }

  private CommitDto extractCommit(List<InputPart> input) throws IOException {
    if (input != null && !input.isEmpty()) {
      String content = input.get(0).getBodyAsString();
      try (JsonParser parser = new JsonFactory().createParser(content)) {
        parser.setCodec(new ObjectMapper());
        CommitDto commitDto = parser.readValueAs(CommitDto.class);
        if (StringUtils.isEmpty(commitDto.getCommitMessage())) {
          throw new MessageMissingException();
        }
        return commitDto;
      }
    }
    throw new MessageMissingException();
  }

  private String parseFileName(MultivaluedMap<String, String> headers) {
    String[] contentDispositionHeader = headers.getFirst("Content-Disposition").split(";");
    for (String name : contentDispositionHeader) {
      if ((name.trim().startsWith("filename"))) {
        String[] tmp = name.split("=");
        return removeQuotes(tmp[1]);
      }
    }
    throw new FileNameMissingException();
  }

  private String removeQuotes(String s) {
    if (s.startsWith("\"")) {
      s = s.substring(1);
    }
    if (s.endsWith("\"")) {
      return s.substring(0, s.length() - 1);
    } else {
      return s;
    }
  }

  private static class MessageMissingException extends BadRequestException {

    private static final String CODE = "AnRacIBuV1";

    public MessageMissingException() {
      super(Collections.emptyList(), "form part for commit object with key 'message' missing or without message");
    }

    @Override
    public String getCode() {
      return CODE;
    }
  }

  private static class FileNameMissingException extends BadRequestException {

    private static final String CODE = "CIRacPIOH1";

    public FileNameMissingException() {
      super(Collections.emptyList(), "Content-Disposition header missing or it has no 'filename' value");
    }

    @Override
    public String getCode() {
      return CODE;
    }
  }

  @FunctionalInterface
  private interface UploadProcessor {
    void process(EditorService.FileUploader fileUploader, String fileName, InputStream stream);
  }
}

