import { ACCESS_CODE_PAGES } from '../constants';

export type AccessCode = (typeof ACCESS_CODE_PAGES)[keyof typeof ACCESS_CODE_PAGES];
