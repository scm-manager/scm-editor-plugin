package com.cloudogu.scm.editor;

import sonia.scm.BadRequestException;
import sonia.scm.ContextEntry;

class UploadFailedException extends BadRequestException {

  private static final String CODE = "4uRaXHBhs1";

  public UploadFailedException(String fileName) {
    super(new ContextEntry.ContextBuilder().in("file", fileName).build(), "upload failed");
  }

  @Override
  public String getCode() {
    return CODE;
  }
}
