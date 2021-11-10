package com.cloudogu.scm.editor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MoveDto extends CommitDto {
  @NotNull
  @Size(min = 1)
  private String newPath;
}
