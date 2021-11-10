export type MoveRequest = {
  commitMessage: string;
  branch: string | null | undefined;
  newPath: string;
};
