import { ACCESS_CODE_PAGES } from '@ukef/constants';

export type AccessCode = (typeof ACCESS_CODE_PAGES)[keyof typeof ACCESS_CODE_PAGES];
