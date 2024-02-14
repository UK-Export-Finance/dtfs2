import { ValuesOf } from '@ukef/dtfs2-common';
import { DB_COLLECTIONS } from '../../constants/db-collections';

export type DbCollectionName = ValuesOf<typeof DB_COLLECTIONS>;
