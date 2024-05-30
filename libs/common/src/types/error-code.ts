import { ERROR_CODE } from '../constants/error-code';
import { ValuesOf } from './types-helper';

export type ErrorCode = ValuesOf<typeof ERROR_CODE>;
