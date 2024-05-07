import { Document, WithoutId } from 'mongodb';

export const withoutMongoId = <TDocument extends Document>(objectWithId: TDocument): WithoutId<TDocument> => {
  const { ...rest } = objectWithId;
  return rest;
};
