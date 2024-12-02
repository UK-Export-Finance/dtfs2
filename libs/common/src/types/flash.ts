import { FLASH_TYPES } from '../constants';
import { ValuesOf } from './types-helper';

export type FlashTypes = ValuesOf<typeof FLASH_TYPES>;
