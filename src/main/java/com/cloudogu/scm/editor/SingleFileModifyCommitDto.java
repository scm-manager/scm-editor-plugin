package com.cloudogu.scm.editor;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
public class SingleFileModifyCommitDto extends CommitDto {

  @NotNull
  private String fileContent;

  public SingleFileModifyCommitDto(@NotNull @Size(min = 1) String commitMessage, String branch, String expectedRevision, String fileContent) {
    super(commitMessage, branch, expectedRevision);
    this.fileContent = fileContent;
  }
}
