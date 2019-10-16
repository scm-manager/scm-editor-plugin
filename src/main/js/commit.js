export type Commit = {
  commitMessage: string,
  branch: ?string,
  expectedRevision: ?string,
  name: {[string]: string}
}
