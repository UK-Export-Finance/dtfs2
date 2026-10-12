import { CUSTOMER_TYPE } from '../constants/salesforce';
import { ValuesOf } from './types-helper';

export type CustomerType = ValuesOf<typeof CUSTOMER_TYPE>;
