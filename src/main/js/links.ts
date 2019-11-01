import { Repository, Changeset } from "@scm-manager/ui-types";

export function createSourceExtensionUrl(repository: Repository, extension: string, revision?: string, path?: string) {
  const url = `/repo/${repository.namespace}/${repository.name}/sourceext/${extension}/`;
  return append(url, revision, path);
}

export function createSourceUrl(repository: Repository, revision?: string, path?: string) {
  const url = `/repo/${repository.namespace}/${repository.name}/sources/`;

  return append(url, revision, path);
}

export function createSourceUrlFromChangeset(repository: Repository, changeset: Changeset, path?: string) {
  const revision = getBranchOrId(changeset);
  return createSourceUrl(repository, revision, path);
}

function getBranchOrId(changeset: Changeset) {
  return changeset._embedded &&
    changeset._embedded.branches &&
    changeset._embedded.branches[0] &&
    changeset._embedded.branches[0].name
    ? changeset._embedded.branches[0].name
    : changeset.id;
}

function append(url: string, revision?: string, path?: string) {
  if (revision) {
    url += encodeURIComponent(revision);
    if (path) {
      url += "/" + path;
    }
  }
  return url;
}
