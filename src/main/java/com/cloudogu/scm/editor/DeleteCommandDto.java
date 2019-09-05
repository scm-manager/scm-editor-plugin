package com.cloudogu.scm.editor;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Getter
@Setter
public class DeleteCommandDto {
  @NotNull
  @Size(min = 1)
  private String commitMessage;
  private String branch;
  private String expectedRevision;
}
