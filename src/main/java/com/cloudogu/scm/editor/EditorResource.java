package com.cloudogu.scm.editor;

import org.apache.commons.lang.StringUtils;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import sonia.scm.BadRequestException;
import sonia.scm.ContextEntry;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.api.ModifyCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import javax.inject.Inject;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Path(EditorResource.EDITOR_REQUESTS_PATH_V2)
public class EditorResource {

  static final String EDITOR_REQUESTS_PATH_V2 = "v2/edit";

  private final RepositoryServiceFactory repositoryServiceFactory;

  @Inject
  public EditorResource(RepositoryServiceFactory repositoryServiceFactory) {
    this.repositoryServiceFactory = repositoryServiceFactory;
  }

  @POST
  @Path("{namespace}/{name}/{path: .*}")
  public Response create(
    @Context UriInfo uriInfo,
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @PathParam("path") String path,
    MultipartFormDataInput input,
    @QueryParam("branch") String branch
  ) throws IOException {

    try (RepositoryService repositoryService = repositoryServiceFactory.create(new NamespaceAndName(namespace, name))) {
      ModifyCommandBuilder modifyCommand = repositoryService.getModifyCommand();
      if (!StringUtils.isEmpty(branch)) {
        modifyCommand.setBranch(branch);
      }

      Map<String, List<InputPart>> formParts = input.getFormDataMap();

      modifyCommand.setCommitMessage(extractMessage(formParts.get("message")));

      formParts
        .entrySet()
        .stream()
        .filter(e -> e.getKey().startsWith("file"))
        .map(Map.Entry::getValue)
        .forEach(inputParts -> uploadFile(path, modifyCommand, inputParts));
      String targetRevision = modifyCommand.execute();
      return Response.status(200).entity(targetRevision).build();
    }
  }

  private void uploadFile(String path, ModifyCommandBuilder modifyCommand, List<InputPart> inputParts) {
    for (InputPart inputPart : inputParts) {
      // Retrieve headers, read the Content-Disposition header to obtain the original name of the file
      MultivaluedMap<String, String> headers = inputPart.getHeaders();
      String fileName = parseFileName(headers);

      try {
        // Handle the body of that part with an InputStream
        InputStream stream = inputPart.getBody(InputStream.class, null);

        String completeFileName = path + "/" + fileName;

        modifyCommand.createFile(completeFileName).withData(stream);
      } catch (IOException e) {
        throw new UploadFailedException(fileName);
      }
    }
  }

  private String extractMessage(List<InputPart> input) throws IOException {
    for (InputPart inputPart : input) {
      // Handle the body of that part with an InputStream
      return inputPart.getBodyAsString();
    }
    return null;
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
    return "randomName";
  }

  private static class UploadFailedException extends BadRequestException {

    private static final String CODE = "4uRaXHBhs1";

    public UploadFailedException(String fileName) {
      super(new ContextEntry.ContextBuilder().in("file", fileName).build(), "upload failed");
    }

    @Override
    public String getCode() {
      return CODE;
    }
  }
}
