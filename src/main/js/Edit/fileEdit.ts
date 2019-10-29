import { Repository } from "@scm-manager/ui-types";

export function getSources(
  state: any,
  repository: Repository,
  revision: string,
  path: string
): File | null | undefined {
  if (state.sources) {
    return state.sources[createItemId(repository, revision, path)];
  }
  return null;
}

export function createItemId(repository: Repository, revision: string, path: string) {
  const revPart = revision ? revision : "_";
  const pathPart = path ? path : "";
  return `${repository.namespace}/${repository.name}/${revPart}/${pathPart}`;
}
