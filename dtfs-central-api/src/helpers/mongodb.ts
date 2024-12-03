import { Document, WithoutId } from 'mongodb';

export const withoutMongoId = <TDocument extends Document>(objectWithId: TDocument): WithoutId<TDocument> => {
  const { _id, ...rest } = objectWithId;
  console.info('MongoID has been removed %s', _id);

  return rest;
};
