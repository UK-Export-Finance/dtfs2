import { ObjectId } from 'mongodb';
import { Bank, PortalRole, PortalUser } from '@ukef/dtfs2-common';
import { Response } from 'supertest';
import { testApi } from '../../test-api';

const banks = {
  Barclays: {
    id: '956',
    name: 'Barclays Bank',
    emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
  },
  HSBC: {
    id: '961',
    name: 'HSBC',
    emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
  },
  UKEF: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
  },
  any: {
    id: '*',
  },
} as unknown as Record<string, Bank>;

const testUsers = [
  { username: 'no-roles', password: 'P@ssword1234', roles: [] },
  {
    username: 'HSBC-maker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'One',
    email: 'one@email.com',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.HSBC,
  },
  {
    username: 'Barclays-checker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Five',
    email: 'five@email.com',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: banks.Barclays,
  },
  {
    username: 'super-user',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Seven',
    email: 'seven@email.com',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.any,
  },
  {
    username: 'Barclays-maker-checker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Nine',
    email: 'nine@email.com',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: banks.Barclays,
  },

  {
    username: 'maker-tfm',
    password: 'AbC!2345',
    firstname: 'First',
    surname: 'Last',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.UKEF,
  },
  {
    username: 'checker-tfm',
    password: 'AbC!2345',
    firstname: 'Mister',
    surname: 'Checker',
    email: 'checker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: {
      ...banks.UKEF,
      useTFM: true,
    },
  },
] as unknown as PortalUser[];

const finder = (allUsers: PortalUser[]) => () => {
  const fluidBuilder = (users: PortalUser[]) => ({
    all: () => users,
    one: () => users[0],
    withRole: (role: PortalRole) => {
      const usersWithRole = users.filter((user) => user.roles.includes(role));
      return fluidBuilder(usersWithRole);
    },
    withMultipleRoles: (role1: PortalRole, role2: PortalRole) => {
      const usersWithRoles = users.filter((user) => user.roles.includes(role1) && user.roles.includes(role2));
      return fluidBuilder(usersWithRoles);
    },
    withoutRole: (role: PortalRole) => {
      const usersWithoutRole = users.filter((user) => !user.roles.includes(role));
      return fluidBuilder(usersWithoutRole);
    },
    withBankName: (bankName: string) => {
      const usersWithBankName = users.filter((user) => user.bank && user.bank.name === bankName);
      return fluidBuilder(usersWithBankName);
    },
    superuser: () => {
      const superUsers = users.filter((user) => user.bank && user.bank.id === '*');
      return fluidBuilder(superUsers);
    },
  });

  return fluidBuilder(allUsers);
};

interface GetUsersResponse extends Response {
  body: {
    users: { _id: ObjectId }[];
  };
}

interface PostUserResponse extends Response {
  body: {
    _id: ObjectId;
  };
}

export const initialise = async () => {
  const userResponse: GetUsersResponse = await testApi.as().get('/v1/user');
  const existingUsers = userResponse.body.users;

  await Promise.all(existingUsers.map((user) => testApi.as().remove(`/v1/users/${user._id.toString()}`)));

  const loadedUsers = await Promise.all(
    testUsers.map(async (user) => {
      const response: PostUserResponse = await testApi.as().post(user).to('/v1/user');
      return {
        ...user,
        _id: response.body._id,
      };
    }),
  );

  return finder(loadedUsers);
};
