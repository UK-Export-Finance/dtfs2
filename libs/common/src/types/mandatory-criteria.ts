export type GEF_CRITERION = {
  id: string;
  body: string;
  childList?: Array<string>;
};

export type GEF_MANDATORY_CRITERIA = {
  version: number;
  createdAt: number;
  updatedAt: number;
  isInDraft: boolean;
  title: string;
  introText: string;
  criteria: Array<GEF_CRITERION>;
};

export type BSS_EWCS_CRITERION = {
  id: number;
  title: string;
  items: Array<{
    id: number;
    copy: string;
  }>;
};

export type BSS_EWCS_MANDATORY_CRITERIA = {
  version: number;
  criteria: Array<BSS_EWCS_CRITERION>;
};
