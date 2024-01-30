import { LANDING_PAGES } from '../constants';
import { ValuesOf } from './types-helper';

export type LandingPage = ValuesOf<typeof LANDING_PAGES>;
