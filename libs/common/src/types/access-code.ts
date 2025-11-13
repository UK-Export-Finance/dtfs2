import { ACCESS_CODE, ATTEMPTS_LEFT } from '../constants';

export type AccessCode = (typeof ACCESS_CODE)[keyof typeof ACCESS_CODE];

export type AttemptsLeft = (typeof ATTEMPTS_LEFT)[keyof typeof ATTEMPTS_LEFT];
