import { ValuesOf } from '../types-helper';
import { MONGO_DB_COLLECTIONS } from '../../constants';

export type MongoDbCollectionName = ValuesOf<typeof MONGO_DB_COLLECTIONS>;
