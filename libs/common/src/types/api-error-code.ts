import { API_ERROR_CODE } from '../constants';
import { ValuesOf } from './types-helper';

export type ApiErrorCode = ValuesOf<typeof API_ERROR_CODE>;
