import { ACCESS_CODE } from '../constants';

export type AccessCode = (typeof ACCESS_CODE)[keyof typeof ACCESS_CODE];
