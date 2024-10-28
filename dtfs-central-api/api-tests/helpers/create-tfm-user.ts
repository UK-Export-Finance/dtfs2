import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { TfmUser } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { testApi } from '../test-api';

interface CreateUserResponse extends Response {
  body: { _id: string };
}

/**
 * Creates a user by calling the test api, uses default values unless provided
 * @param overrides - properties to override the default user values
 * @returns the created user
 */
export const createTfmUser = async (overrides: Partial<TfmUser> = {}) => {
  const user = {
    username: 'T1_USER_1',
    email: 'T1_USER_1@ukexportfinance.gov.uk',
    salt: '00',
    hash: '01',
    teams: ['TEAM1'],
    timezone: 'Europe/London',
    firstName: 'Joe',
    lastName: 'Bloggs',
    status: 'active',
    auditRecord: {},
    ...overrides,
  };

  const response: CreateUserResponse = await testApi.post({ user, auditDetails: generateTfmAuditDetails(new ObjectId()) }).to('/v1/tfm/users');

  return {
    ...user,
    _id: response.body._id,
  };
};
