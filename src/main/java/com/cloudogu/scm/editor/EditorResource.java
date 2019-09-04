package com.cloudogu.scm.editor;

import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import sonia.scm.BadRequestException;

import javax.annotation.Nullable;
import javax.inject.Inject;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
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
   * This equals {@link EditorResource#create(String, String, String, MultipartFormDataInput, String, String)} with the
   * difference, that files will be added to the root directory of the repository.
   * @see #create(String, String, String, MultipartFormDataInput, String, String)
   */
  @POST
  @Path("{namespace}/{name}")
  public Response createInRoot(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    MultipartFormDataInput input,
    @QueryParam("branch") String branch,
    @QueryParam("revision") String revision
  ) throws IOException {
    return create(namespace, name, "", input, branch, revision);
  }

  /**
   * Uploads files from a request with a multipart form. Each form data with names starting with 'file' will be
   * expected to have a content disposition header with a value for 'filename' (eg.
   * <code>Content-Disposition: form-data; name="file1"; filename="pom.xml"</code>). Additionally a form data with
   * name 'message' with the commit message is required
   * (eg. <code>Content-Disposition: form-data; name=" message"....My message..</code>).
   * <br>
   * To upload two files 'resource.xml' and 'data.json' to a repository 'scmadmin/repo' on branch 'master' in folder
   * 'src/resources' with curl, you will have to call something like
   * <pre>
   * curl -v scmadmin:scmadmin \
   *   http://localhost:8081/scm/api/v2/edit/scmadmin/repo/src/resources\?branch\=master \
   *   -F 'file1=@resource.xml' \
   *   -F 'file2=@data.json' \
   *   -F 'message=Commit message'
   * </pre>
   *
   * @param namespace The namespace of the repository.
   * @param name      The name of the repository.
   * @param path      The destination directory for the new file.
   * @param input     The form data. These will have to have parts with names starting with 'name' for the files to
   *                  upload and part with name 'message' for the commit message.
   * @param branch    The branch the change should be made upon (optional). If this is omitted, the default branch will
   *                  be used.
   * @param revision  The expected revision the change should be made upon (optional). If this is set, the changes
   *                  will only be applied if the revision of the branch (either the specified or the default branch)
   *                  equals the given revision. If this is not the case, a conflict (status code 409) will be
   *                  returned.
   * @throws IOException Whenever there were exceptions handling the uploaded files.
   */
  @POST
  @Path("{namespace}/{name}/{path: .*}")
  public Response create(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Nullable @PathParam("path") String path,
    MultipartFormDataInput input,
    @QueryParam("branch") String branch,
    @QueryParam("revision") String revision
  ) throws IOException {
    Map<String, List<InputPart>> formParts = input.getFormDataMap();
    String commitMessage = extractMessage(formParts.get("message"));
    EditorService.FileUploader fileUploader = editorService.prepare(namespace, name, branch, path, commitMessage, revision);
    formParts
      .entrySet()
      .stream()
      .filter(e -> e.getKey().startsWith("file"))
      .map(Map.Entry::getValue)
      .forEach(inputParts -> uploadFile(fileUploader, inputParts));
    String targetRevision = fileUploader.done();
    return Response.status(SC_CREATED).entity(targetRevision).build();
  }

  private void uploadFile(EditorService.FileUploader fileUploader, List<InputPart> inputParts) {
    for (InputPart inputPart : inputParts) {
      String fileName = parseFileName(inputPart.getHeaders());

      try {
        InputStream stream = inputPart.getBody(InputStream.class, null);
        fileUploader.upload(fileName, stream);
      } catch (IOException e) {
        throw new UploadFailedException(fileName);
      }
    }
  }

  private String extractMessage(List<InputPart> input) throws IOException {
    if (input != null && !input.isEmpty()) {
      return input.get(0).getBodyAsString();
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
      super(Collections.emptyList(), "form part for commit message with key 'message' missing");
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
}
