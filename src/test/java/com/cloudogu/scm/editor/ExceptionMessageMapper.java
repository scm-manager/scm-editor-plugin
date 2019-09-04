package com.cloudogu.scm.editor;

import org.apache.shiro.authz.UnauthorizedException;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static javax.servlet.http.HttpServletResponse.SC_FORBIDDEN;

@Provider
public class ExceptionMessageMapper implements ExceptionMapper<Exception> {
  @Override
  public Response toResponse(Exception exception) {
    exception.printStackTrace();
    return Response
      .status(exception instanceof UnauthorizedException? SC_FORBIDDEN: SC_BAD_REQUEST)
      .entity(exception.getClass().getName() + "\n" + exception.getMessage())
      .build();
  }
}
