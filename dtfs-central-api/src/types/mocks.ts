import { Collection } from 'mongodb';

export type CollectionMock = Collection & {
  updateOne?: jest.Mock<unknown>;
  deleteOne?: jest.Mock<unknown>;
  findOne?: jest.Mock<unknown>;
};
