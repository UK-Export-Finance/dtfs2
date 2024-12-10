import { ObjectId } from 'mongodb';

export type TestUser = {
  username: string;
  password: string;
  firstname: string;
  surname: string;
  email: string;
  timezone: string;
  roles: string[];
  bank: {
    id: string;
    name: string;
    emails?: string[];
  };
  isTrusted: boolean;
  _id?: ObjectId;
  token?: string;
};
