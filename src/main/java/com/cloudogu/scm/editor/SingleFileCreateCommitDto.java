package com.cloudogu.scm.editor;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
public class SingleFileCreateCommitDto extends CommitDto {

  @NotNull
  @Size(min = 1)
  private String fileName;
  @NotNull
  private String fileContent;

  public SingleFileCreateCommitDto(@NotNull @Size(min = 1) String commitMessage, String branch, String expectedRevision, String fileName, String fileContent) {
    super(commitMessage, branch, expectedRevision);
    this.fileName = fileName;
    this.fileContent = fileContent;
  }
}
