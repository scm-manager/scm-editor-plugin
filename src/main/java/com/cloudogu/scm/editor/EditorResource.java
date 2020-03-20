/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package com.cloudogu.scm.editor;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.ByteSource;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang.StringUtils;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import org.jboss.resteasy.plugins.providers.multipart.MultipartInputImpl;
import sonia.scm.BadRequestException;
import sonia.scm.api.v2.resources.ChangesetDto;
import sonia.scm.api.v2.resources.ChangesetToChangesetDtoMapper;
import sonia.scm.api.v2.resources.ErrorDto;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.RepositoryManager;
import sonia.scm.web.VndMediaType;

import javax.annotation.Nullable;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.apache.http.HttpStatus.SC_CREATED;

@OpenAPIDefinition(tags = {
  @Tag(name = "Editor Plugin", description = "Editor plugin provided endpoints")
})
@Path(EditorResource.EDITOR_REQUESTS_PATH_V2)
public class EditorResource {

  static final String EDITOR_REQUESTS_PATH_V2 = "v2/edit";

  private final EditorService editorService;
  private final ChangesetToChangesetDtoMapper changesetMapper;
  private final RepositoryManager repositoryManager;

  @Inject
  public EditorResource(EditorService editorService, ChangesetToChangesetDtoMapper changesetMapper, RepositoryManager repositoryManager) {
    this.editorService = editorService;
    this.changesetMapper = changesetMapper;
    this.repositoryManager = repositoryManager;
  }

  /**
   * This equals {@link EditorResource#createWithJson(String, String, String, SingleFileCreateCommitDto)} with the
   * difference, that files will be added to the root directory of the repository.
   * @see #createWithJson(String, String, String, SingleFileCreateCommitDto)
   */
  @POST
  @Path("{namespace}/{name}/create")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
    summary = "Create file in root",
    description = "Creates a new file in the root directory with a JSON-based request as new commit. Returns the created changeset.",
    tags = "Editor Plugin",
    operationId = "editor_create_root_file"
  )
  @ApiResponse(
    responseCode = "201",
    description = "create commit success",
    content = @Content(
      mediaType = MediaType.APPLICATION_JSON,
      schema = @Schema(implementation = ChangesetDto.class)
    )
  )
  @ApiResponse(responseCode = "401", description = "not authenticated / invalid credentials")
  @ApiResponse(responseCode = "403", description = "not authorized, the current user does not have the \"push:repository\" privilege")
  @ApiResponse(
    responseCode = "500",
    description = "internal server error",
    content = @Content(
      mediaType = VndMediaType.ERROR_TYPE,
      schema = @Schema(implementation = ErrorDto.class)
    )
  )
  public Response createWithJsonInRoot(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Valid SingleFileCreateCommitDto fileCommit
  ) throws IOException {
    try (EditorService.FileUploader fileUploader = prepareEditorService(namespace, name, "", fileCommit)) {
      fileUploader.create(fileCommit.getFileName(), new ByteArrayInputStream(fileCommit.getFileContent().getBytes(UTF_8)));
      Changeset newCommit = fileUploader.done();
      ChangesetDto newCommitDto = changesetMapper.map(newCommit, repositoryManager.get(new NamespaceAndName(namespace, name)));
      return Response.status(SC_CREATED).entity(newCommitDto).build();
    }
  }

  /**
   * This equals {@link EditorResource#create(String, String, String, MultipartFormDataInput)} with the
   * difference, that files will be added to the root directory of the repository.
   * @see #create(String, String, String, MultipartFormDataInput)
   */
  @POST
  @Path("{namespace}/{name}/create")
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
    summary = "Create file in root",
    description = "Creates a new file in the root directory with a form-based request as new commit. Returns the created changeset.",
    hidden = true
  )
  @ApiResponse(
    responseCode = "201",
    description = "create commit success",
    content = @Content(
      mediaType = MediaType.APPLICATION_JSON,
      schema = @Schema(implementation = ChangesetDto.class)
    )
  )
  @ApiResponse(responseCode = "401", description = "not authenticated / invalid credentials")
  @ApiResponse(responseCode = "403", description = "not authorized, the current user does not have the \"push:repository\" privilege")
  @ApiResponse(
    responseCode = "500",
    description = "internal server error",
    content = @Content(
      mediaType = VndMediaType.ERROR_TYPE,
      schema = @Schema(implementation = ErrorDto.class)
    )
  )
  public Response createInRoot(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    MultipartFormDataInput input
  ) throws IOException {
    return create(namespace, name, "", input);
  }

  /**
   * Creates a new file from a simple json request. The file name of the new file has to be given as 'fileName', the
   * content as 'fileContent'. Additionally the commmit message is required as 'commitMessage'.
   * <br>
   * To create a file 'data' to a repository 'scmadmin/repo' on branch 'master' in folder
   * 'src/resources' with curl, you will have to call something like
   * <pre>
   * curl -u scmadmin:scmadmin \
   *   http://localhost:8081/scm/api/v2/edit/scmadmin/repo/create/src/resources \
   *   -H 'Content-Type: application/json' \
   *   --data '{"fileName": "data", "fileContent": "content", "commitMessage": "Commit message", "branch": "master"}'
   * </pre>
   *
   * @param namespace  The namespace of the repository.
   * @param name       The name of the repository.
   * @param path       The destination directory for the new file.
   * @param fileCommit The commit object with the following attributes:
   *                   <ul>
   *                     <li>The commit message for the new commit (this is required).</li>
   *                     <li>The branch the change should be made upon (optional). If this is omitted, the default
   *                       branch will be used.</li>
   *                     <li>The expected revision the change should be made upon (optional). If this is set, the changes
   *                       will only be applied if the revision of the branch (either the specified or the default branch)
   *                       equals the given revision. If this is not the case, a conflict (status code 409) will be
   *                       returned.</li>
   *                     <li>The file name (required)</li>
   *                     <li>The file content (required)</li>
   *                   </ul>
   * @throws IOException Whenever there were exceptions handling the uploaded file.
   */
  @POST
  @Path("{namespace}/{name}/create/{path: .*}")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
    summary = "Create file",
    description = "Creates a new file in any directory with a JSON-based request as new commit. Returns the created changeset.",
    tags = "Editor Plugin",
    operationId = "editor_create_file"
  )
  @ApiResponse(
    responseCode = "201",
    description = "create commit success",
    content = @Content(
      mediaType = MediaType.APPLICATION_JSON,
      schema = @Schema(implementation = ChangesetDto.class)
    )
  )
  @ApiResponse(responseCode = "401", description = "not authenticated / invalid credentials")
  @ApiResponse(responseCode = "403", description = "not authorized, the current user does not have the \"push:repository\" privilege")
  @ApiResponse(
    responseCode = "500",
    description = "internal server error",
    content = @Content(
      mediaType = VndMediaType.ERROR_TYPE,
      schema = @Schema(implementation = ErrorDto.class)
    )
  )
  public Response createWithJson(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Nullable @PathParam("path") String path,
    @Valid SingleFileCreateCommitDto fileCommit
  ) throws IOException {
    try (EditorService.FileUploader fileUploader = prepareEditorService(namespace, name, path, fileCommit)) {
      fileUploader.create(fileCommit.getFileName(), new ByteArrayInputStream(fileCommit.getFileContent().getBytes(UTF_8)));
      Changeset newCommit = fileUploader.done();
      ChangesetDto newCommitDto = changesetMapper.map(newCommit, repositoryManager.get(new NamespaceAndName(namespace, name)));
      return Response.status(SC_CREATED).entity(newCommitDto).build();
    }
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
   * curl -u scmadmin:scmadmin \
   *   http://localhost:8081/scm/api/v2/edit/scmadmin/repo/create/src/resources \
   *   -F 'file1=@resource.xml' \
   *   -F 'file2=@data.json' \
   *   -F 'commit={"commitMessage": "Commit message", "branch": "master", "names": {"file1": "resource.xml", "file2": "data.json"} }'
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
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
    summary = "Create file",
    description = "Creates a new file in any directory with a form-based request as new commit. Returns the created changeset.",
    hidden = true
  )
  @ApiResponse(
    responseCode = "201",
    description = "create commit success",
    content = @Content(
      mediaType = MediaType.APPLICATION_JSON,
      schema = @Schema(implementation = ChangesetDto.class)
    )
  )
  @ApiResponse(responseCode = "401", description = "not authenticated / invalid credentials")
  @ApiResponse(responseCode = "403", description = "not authorized, the current user does not have the \"push:repository\" privilege")
  @ApiResponse(
    responseCode = "500",
    description = "internal server error",
    content = @Content(
      mediaType = VndMediaType.ERROR_TYPE,
      schema = @Schema(implementation = ErrorDto.class)
    )
  )
  public Response create(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Nullable @PathParam("path") String path,
    MultipartFormDataInput input
  ) throws IOException {
    Changeset newCommit = processFiles(namespace, name, path, input, EditorService.FileUploader::create);
    ChangesetDto newCommitDto = changesetMapper.map(newCommit, repositoryManager.get(new NamespaceAndName(namespace, name)));
    return Response.status(SC_CREATED).entity(newCommitDto).build();
  }

  /**
   * This equals {@link EditorResource#modify(String, String, String, MultipartFormDataInput)} with the
   * difference, that files will be modified in the root directory of the repository.
   * @see #create(String, String, String, MultipartFormDataInput)
   */
  @POST
  @Path("{namespace}/{name}/modify")
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
    summary = "Modify file",
    description = "Modifies an existing file in the root directory with a form-based request as new commit. Returns the created changeset.",
    hidden = true
  )
  @ApiResponse(
    responseCode = "201",
    description = "create commit success",
    content = @Content(
      mediaType = MediaType.APPLICATION_JSON,
      schema = @Schema(implementation = ChangesetDto.class)
    )
  )
  @ApiResponse(responseCode = "401", description = "not authenticated / invalid credentials")
  @ApiResponse(responseCode = "403", description = "not authorized, the current user does not have the \"push:repository\" privilege")
  @ApiResponse(responseCode = "404", description = "not found, this file is not available")
  @ApiResponse(
    responseCode = "500",
    description = "internal server error",
    content = @Content(
      mediaType = VndMediaType.ERROR_TYPE,
      schema = @Schema(implementation = ErrorDto.class)
    )
  )
  public Response modifyInRoot(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    MultipartFormDataInput input
  ) throws IOException {
    return modify(namespace, name, "", input);
  }

  /**
   * Modifies a file from a simple json request. The file name of the new file is taken from the path, the
   * content as 'fileContent'. Additionally the commmit message is required as 'commitMessage'.
   * <br>
   * To modify a file 'data' to a repository 'scmadmin/repo' on branch 'master' in folder
   * 'src/resources' with curl, you will have to call something like
   * <pre>
   * curl -u scmadmin:scmadmin \
   *   http://localhost:8081/scm/api/v2/edit/scmadmin/repo/modify/src/resources/data \
   *   -H 'Content-Type: application/json' \
   *   --data '{"fileContent": "content", "commitMessage": "Commit message", "branch": "master"}'
   * </pre>
   *
   * @param namespace  The namespace of the repository.
   * @param name       The name of the repository.
   * @param path       The destination directory and file name for the new file.
   * @param fileCommit The commit object with the following attributes:
   *                   <ul>
   *                     <li>The commit message for the new commit (this is required).</li>
   *                     <li>The branch the change should be made upon (optional). If this is omitted, the default
   *                       branch will be used.</li>
   *                     <li>The expected revision the change should be made upon (optional). If this is set, the changes
   *                       will only be applied if the revision of the branch (either the specified or the default branch)
   *                       equals the given revision. If this is not the case, a conflict (status code 409) will be
   *                       returned.</li>
   *                     <li>The file content (required)</li>
   *                   </ul>
   * @throws IOException Whenever there were exceptions handling the uploaded file.
   */
  @POST
  @Path("{namespace}/{name}/modify/{path: .*}")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
    summary = "Modify file",
    description = "Modifies an existing file with a JSON-based request as new commit. Returns the created changeset.",
    tags = "Editor Plugin",
    operationId = "editor_modify_file"
  )
  @ApiResponse(
    responseCode = "201",
    description = "create commit success",
    content = @Content(
      mediaType = MediaType.APPLICATION_JSON,
      schema = @Schema(implementation = ChangesetDto.class)
    )
  )
  @ApiResponse(responseCode = "401", description = "not authenticated / invalid credentials")
  @ApiResponse(responseCode = "403", description = "not authorized, the current user does not have the \"push:repository\" privilege")
  @ApiResponse(responseCode = "404", description = "not found, this file is not available")
  @ApiResponse(
    responseCode = "500",
    description = "internal server error",
    content = @Content(
      mediaType = VndMediaType.ERROR_TYPE,
      schema = @Schema(implementation = ErrorDto.class)
    )
  )
  public Response modifyWithJson(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @PathParam("path") String path,
    @Valid SingleFileModifyCommitDto fileCommit
  ) throws IOException {
    String[] pathAndFileName = extractFileName(path);
    try (EditorService.FileUploader fileUploader = prepareEditorService(namespace, name, pathAndFileName[0], fileCommit)) {
      fileUploader.modify(pathAndFileName[1], new ByteArrayInputStream(fileCommit.getFileContent().getBytes(UTF_8)));
      Changeset newCommit = fileUploader.done();
      ChangesetDto newCommitDto = changesetMapper.map(newCommit, repositoryManager.get(new NamespaceAndName(namespace, name)));
      return Response.status(SC_CREATED).entity(newCommitDto).build();
    }
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
   * curl -u scmadmin:scmadmin \
   *   http://localhost:8081/scm/api/v2/edit/scmadmin/repo/modify/src/resources\?branch\=master \
   *   -F 'file1=@resource.xml' \
   *   -F 'file2=@data.json' \
   *   -F 'commit={"commitMessage": "Commit message", "branch": "master", "names": {"file1": "resource.xml", "file2": "data.json"} }'
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
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
    summary = "Modify file",
    description = "Modifies an existing file with a form-based request as new commit. Returns the created changeset.",
    hidden = true
  )
  @ApiResponse(
    responseCode = "201",
    description = "create commit success",
    content = @Content(
      mediaType = MediaType.APPLICATION_JSON,
      schema = @Schema(implementation = ChangesetDto.class)
    )
  )
  @ApiResponse(responseCode = "401", description = "not authenticated / invalid credentials")
  @ApiResponse(responseCode = "403", description = "not authorized, the current user does not have the \"push:repository\" privilege")
  @ApiResponse(responseCode = "404", description = "not found, this file is not available")
  @ApiResponse(
    responseCode = "500",
    description = "internal server error",
    content = @Content(
      mediaType = VndMediaType.ERROR_TYPE,
      schema = @Schema(implementation = ErrorDto.class)
    )
  )
  public Response modify(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Nullable @PathParam("path") String path,
    MultipartFormDataInput input
  ) throws IOException {
    Changeset newCommit = processFiles(namespace, name, path, input, EditorService.FileUploader::modify);
    ChangesetDto newCommitDto = changesetMapper.map(newCommit, repositoryManager.get(new NamespaceAndName(namespace, name)));
    return Response.status(SC_CREATED).entity(newCommitDto).build();
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
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
    summary = "Delete file",
    description = "Deletes an existing file as new commit. Returns the created changeset.",
    tags = "Editor Plugin",
    operationId = "editor_delete_file"
  )
  @ApiResponse(
    responseCode = "201",
    description = "create commit success",
    content = @Content(
      mediaType = MediaType.APPLICATION_JSON,
      schema = @Schema(implementation = ChangesetDto.class)
    )
  )
  @ApiResponse(responseCode = "401", description = "not authenticated / invalid credentials")
  @ApiResponse(responseCode = "403", description = "not authorized, the current user does not have the \"push:repository\" privilege")
  @ApiResponse(
    responseCode = "500",
    description = "internal server error",
    content = @Content(
      mediaType = VndMediaType.ERROR_TYPE,
      schema = @Schema(implementation = ErrorDto.class)
    )
  )
  public Response delete(
    @PathParam("namespace") String namespace,
    @PathParam("name") String name,
    @Nullable @PathParam("path") String path,
    @Valid CommitDto commit
  ) throws IOException {
    Changeset newCommit =
      editorService.delete(
        namespace,
        name,
        commit.getBranch(),
        path,
        commit.getCommitMessage(),
        commit.getExpectedRevision());
    ChangesetDto newCommitDto = changesetMapper.map(newCommit, repositoryManager.get(new NamespaceAndName(namespace, name)));
    return Response.status(SC_CREATED).entity(newCommitDto).build();
  }

  private String[] extractFileName(String path) {
    if (path.endsWith("/")) {
      path = path.substring(0, path.length() - 1);
    }
    if (!path.contains("/")) {
      return new String[]{"", path};
    } else {
      int lastSlash = path.lastIndexOf('/');
      return new String[]{path.substring(0, lastSlash), path.substring(lastSlash + 1)};
    }
  }

  private Changeset processFiles(String namespace, String name, String path, MultipartFormDataInput input, UploadProcessor processor) throws IOException {
    Map<String, List<InputPart>> formParts = input.getFormDataMap();
    FileMappingCommitDto commit = extractCommit(formParts.get("commit"));
    try (EditorService.FileUploader fileUploader = prepareEditorService(namespace, name, path, commit)) {
      formParts
        .entrySet()
        .stream()
        .filter(e -> e.getKey().startsWith("file"))
        .map(Map.Entry::getValue)
        .forEach(inputParts -> processFile(fileUploader, inputParts, processor, commit));
      return fileUploader.done();
    }
  }

  private EditorService.FileUploader prepareEditorService(String namespace, String name, String path, CommitDto commit) {
    return editorService.prepare(namespace, name, commit.getBranch(), path, commit.getCommitMessage(), commit.getExpectedRevision());
  }

  private void processFile(EditorService.FileUploader fileUploader, List<InputPart> inputParts, UploadProcessor uploadProcessor, FileMappingCommitDto commit) {
    for (InputPart inputPart : inputParts) {
      String fileName = commit.getNames().get(parseFileName(inputPart.getHeaders()));

      try {
        InputStream stream = inputPart.getBody(InputStream.class, null);
        uploadProcessor.process(fileUploader, fileName, stream);
      } catch (IOException e) {
        throw new UploadFailedException(fileName);
      }
    }
  }

  private FileMappingCommitDto extractCommit(List<InputPart> input) throws IOException {
    if (input != null && !input.isEmpty()) {
      String content = readBodyForCommitObject(input);
      try (JsonParser parser = new JsonFactory().createParser(content)) {
        parser.setCodec(new ObjectMapper());
        FileMappingCommitDto commitDto = parser.readValueAs(FileMappingCommitDto.class);
        if (StringUtils.isEmpty(commitDto.getCommitMessage())) {
          throw new MessageMissingException();
        }
        return commitDto;
      }
    }
    throw new MessageMissingException();
  }

  private String readBodyForCommitObject(List<InputPart> input) throws IOException {
    return new ByteSource() {
      @Override
      public InputStream openStream() throws IOException {
        return ((MultipartInputImpl.PartImpl) input.get(0)).getBody();
      }
    }.asCharSource(UTF_8).read();
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

