import { Collection } from 'mongodb';

export type MockUtilisationReport = {
  bank: {
    id: string;
    name: string;
  };
  month: number;
  year: number;
  azureFileInfo?: {
    fullPath: string;
  };
};

export type CollectionMock = Collection & {
  updateOne?: jest.Mock<unknown>;
  deleteOne?: jest.Mock<unknown>;
  findOne?: jest.Mock<unknown>;
};
