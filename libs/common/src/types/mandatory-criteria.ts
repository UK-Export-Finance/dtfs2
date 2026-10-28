export type GefCriterion = {
  id: string;
  body: string;
  childList?: Array<string>;
};

export type GefMandatoryCriteria = {
  version: number;
  createdAt: number;
  updatedAt: number;
  isInDraft: boolean;
  title: string;
  introText: string;
  criteria: Array<GefCriterion>;
};

export type BssEwcsCriterion = {
  id: number;
  title: string;
  items: Array<{
    id: number;
    copy: string;
  }>;
};

export type BssEwcsMandatoryCriteria = {
  version: number;
  criteria: Array<BssEwcsCriterion>;
};
