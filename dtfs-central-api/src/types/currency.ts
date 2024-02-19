import { ValuesOf } from '@ukef/dtfs2-common';
import { CURRENCIES } from '../constants';

export type Currency = ValuesOf<typeof CURRENCIES>;
