import { Document, EJSON } from 'bson';

export const deserialiseEJson = <TResult extends object>(ejson: object): TResult =>
  EJSON.deserialize(ejson as Document) as TResult;
