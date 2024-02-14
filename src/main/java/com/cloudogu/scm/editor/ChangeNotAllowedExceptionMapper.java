/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
