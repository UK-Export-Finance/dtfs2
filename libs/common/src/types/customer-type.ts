import { CUSTOMER_TYPE } from '@ukef/constants/salesforce';
import { ValuesOf } from './types-helper';

export type CustomerType = ValuesOf<typeof CUSTOMER_TYPE>;
