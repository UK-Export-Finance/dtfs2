import { Response } from 'supertest';
import { PortalUser, ROLES } from '@ukef/dtfs2-common';
import { generateSystemAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream';
import { testApi } from '../test-api';

interface CreateUserResponse extends Response {
  body: { _id: string };
}

/**
 * Creates a user by calling the test api, uses default values unless provided
 * @param overrides - properties to override the default user values
 * @returns the created user
 */
export const createPortalUser = async (overrides: Partial<PortalUser> = {}) => {
  const user = {
    username: 'maker1@ukexportfinance.gov.uk',
    firstname: 'First',
    surname: 'Last',
    salt: '00',
    hash: '01',
    email: 'maker1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [ROLES.MAKER],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
      emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
      companiesHouseNo: 'UKEF0001',
      partyUrn: '00318345',
    },
    isTrusted: true,
    'user-status': 'active',
    auditRecord: generateSystemAuditDatabaseRecord(),
    ...overrides,
  };

  const response: CreateUserResponse = await testApi.post(user).to('/v1/user');

  return {
    ...user,
    _id: response.body._id,
  };
};
