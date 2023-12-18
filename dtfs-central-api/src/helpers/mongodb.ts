import { Document, WithoutId } from 'mongodb';

export const withoutMongoId = <TDocument extends Document>(objectWithId: TDocument): WithoutId<TDocument> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = objectWithId;
  return rest;
};
