export type Commit = {
  commitMessage: string;
  branch: string | null | undefined;
  expectedRevision: string | null | undefined;
  name: {
    [key: string]: string;
  };
};
