import { Bank } from './mongo-db-models/banks';

export type SessionBank = Pick<Bank, 'id' | 'name'>;
