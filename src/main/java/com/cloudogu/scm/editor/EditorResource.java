package com.cloudogu.scm.editor;

import org.apache.http.HttpStatus;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import sonia.scm.BadRequestException;

import javax.annotation.Nullable;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
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
   * This equals {@link EditorResource#create(String, String, String, MultipartFormDataInput, String)} with the
   * difference, that files will be added to the root directory of the repository.
   * @see #create(String, String, String, MultipartFormDataInput, String)
   */
  @POST
  @Path("{namespace}/{name}")
  @Consumes("multipart/form-data")
  public Response createInRoot(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    MultipartFormDataInput input,
    @QueryParam("branch") String branch
  ) throws IOException {
    return create(namespace, name, "", input, branch);
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
   * @param input     The form data. These will have to have parts with names starting with 'name' for the files to upload
   *                  and part with name 'message' for the commit message.
   * @param branch    The branch the change should be made upon.
   * @throws IOException Whenever there were exceptions handling the uploaded files.
   */
  @POST
  @Path("{namespace}/{name}/{path: .*}")
  @Consumes("multipart/form-data")
  public Response create(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Nullable @PathParam("path") String path,
    MultipartFormDataInput input,
    @QueryParam("branch") String branch
  ) throws IOException {
    Map<String, List<InputPart>> formParts = input.getFormDataMap();
    String commitMessage = extractMessage(formParts.get("message"));
    EditorService.FileUploader fileUploader = editorService.prepare(namespace, name, branch, path, commitMessage);
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
      // Retrieve headers, read the Content-Disposition header to obtain the original name of the file
      MultivaluedMap<String, String> headers = inputPart.getHeaders();
      String fileName = parseFileName(headers);

      try {
        // Handle the body of that part with an InputStream
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

  // Parse Content-Disposition header to get the original file name
  private String parseFileName(MultivaluedMap<String, String> headers) {
    String[] contentDispositionHeader = headers.getFirst("Content-Disposition").split(";");
    for (String name : contentDispositionHeader) {
      if ((name.trim().startsWith("filename"))) {
        String[] tmp = name.split("=");
        return tmp[1].trim().replaceAll("\"", "");
      }
    }
    throw new FileNameMissingException();
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
