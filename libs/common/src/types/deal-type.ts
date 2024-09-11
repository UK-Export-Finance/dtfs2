import { DEAL_TYPE } from '../constants';
import { ValuesOf } from './types-helper';

export type DealType = ValuesOf<typeof DEAL_TYPE>;
