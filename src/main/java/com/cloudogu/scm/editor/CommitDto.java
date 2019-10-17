package com.cloudogu.scm.editor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommitDto {
  @NotNull
  @Size(min = 1)
  private String commitMessage;
  private String branch;
  private String expectedRevision;
  private Map<String, String> names;
}
