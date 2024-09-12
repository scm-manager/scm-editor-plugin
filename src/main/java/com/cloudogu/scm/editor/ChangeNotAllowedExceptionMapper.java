/*
 * Copyright (c) 2020 - present Cloudogu GmbH
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

package com.cloudogu.scm.editor;


import org.slf4j.MDC;
import sonia.scm.ContextEntry;
import sonia.scm.web.VndMediaType;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
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
