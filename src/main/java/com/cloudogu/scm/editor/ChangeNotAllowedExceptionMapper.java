package com.cloudogu.scm.editor;


import org.slf4j.MDC;
import sonia.scm.ContextEntry;
import sonia.scm.web.VndMediaType;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Provider
public class ChangeNotAllowedExceptionMapper implements ExceptionMapper<ChangeNotAllowedException> {
  @Override
  public Response toResponse(ChangeNotAllowedException exception) {
    return Response.status(403)
      .entity(new Object() {
        public String getTransactionId() {
          return MDC.get("transaction_id");
        }

        public String getErrorCode() {
          return exception.getCode();
        }

        public List<ContextEntry> getContext() {
          return exception.getContext();
        }

        public String getMessage() {
          return exception.getMessage();
        }

        public Collection<Object> getViolations() {
          return exception.getObstacles()
            .stream()
            .map(ChangeObstacle::getKey)
            .map(key -> new Object() { public String getKey() { return key; }})
            .collect(Collectors.toList());
        }
      }).type(VndMediaType.ERROR_TYPE).build();
  }
}
