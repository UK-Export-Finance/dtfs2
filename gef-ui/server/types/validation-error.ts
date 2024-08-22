export type ValidationError = {
  errRef: string;
  errMsg: string;
  errCode?: string;
  subFieldErrorRefs?: string[];
};
