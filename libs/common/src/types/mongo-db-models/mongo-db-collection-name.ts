import { ValuesOf } from '@ukef/types/types-helper';
import { MONGO_DB_COLLECTIONS } from '@ukef/constants';

export type MongoDbCollectionName = ValuesOf<typeof MONGO_DB_COLLECTIONS>;
