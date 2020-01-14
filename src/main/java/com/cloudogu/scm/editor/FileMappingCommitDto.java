package com.cloudogu.scm.editor;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class FileMappingCommitDto extends CommitDto {

  private Map<String, String> names;

  public FileMappingCommitDto(@NotNull @Size(min = 1) String commitMessage, String branch, String expectedRevision, Map<String, String> names) {
    super(commitMessage, branch, expectedRevision);
    this.names = names;
  }
}
