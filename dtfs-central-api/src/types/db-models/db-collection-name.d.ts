import { ValuesOf } from '../types-helper';
import { DB_COLLECTIONS } from '../../constants/db-collections';

export type DbCollectionName = ValuesOf<typeof DB_COLLECTIONS>;
