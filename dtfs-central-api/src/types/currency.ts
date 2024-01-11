import { ValuesOf } from './types-helper';
import { CURRENCIES } from '../constants';

export type Currency = ValuesOf<typeof CURRENCIES>;
