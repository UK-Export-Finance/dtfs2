import { Bank } from './db-models/banks';

export type SessionBank = Pick<Bank, 'id' | 'name'>;
