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

import { useMutation, useQueryClient } from "react-query";
import { useHistory } from "react-router-dom";
import { Changeset, File, Link, Repository } from "@scm-manager/ui-types";
import { apiClient } from "@scm-manager/ui-components";
import { createSourceUrlFromChangeset } from "../links";
import { MoveRequest } from "./moveRequest";

type UseMovePayload = {
  repository: Repository;
  sources: File;
  moveRequest: MoveRequest;
};

export const useMoveFolder = () => {
  const queryClient = useQueryClient();
  const history = useHistory();
  const { mutate, data, isLoading, error } = useMutation<Changeset, Error, UseMovePayload>(
    async ({ moveRequest, sources }) =>
      apiClient.post((sources._links.move as Link).href, moveRequest).then(response => response.json()),
    {
      onSuccess: async (changeset, { repository, moveRequest: { newPath } }) => {
        await queryClient.invalidateQueries(["repository", repository.namespace, repository.name]);
        const pushPath = createSourceUrlFromChangeset(repository, changeset, newPath.slice(1));
        history.push(pushPath);
      }
    }
  );
  return {
    move: (repository: Repository, parent: File, moveRequest: MoveRequest) => {
      mutate({ repository, moveRequest, sources: parent });
    },
    isLoading,
    error,
    changeset: data
  };
};
