import { ObjectId } from 'mongodb';
import { Response } from 'supertest';
import { HttpStatusCode } from 'axios';
import { OTP, USER_STATUS, PortalUser } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../test-helpers';
import { testApi } from '../../test-api';
import { wipe } from '../../wipeDB';
import { mongoDbClient } from '../../../server/drivers/db-client';
import externalApi from '../../../server/external-api/api';

jest.mock('../../../server/external-api/api');

const BASE_URL = '/v1/portal/users/me/sign-in-code';

interface SignInCodeResponse extends Response {
  body: { signInOTPSendCount?: number; message?: string };
}

const TEST_EMAIL = 'test.user@example.com';

const auditDetails = generatePortalAuditDetails(new ObjectId());

beforeEach(() => {
  jest.mocked(externalApi.sendEmail).mockResolvedValue(undefined);
});

const insertUser = async (overrides: Partial<PortalUser> = {}): Promise<PortalUser> => {
  const user: PortalUser = {
    ...aPortalUser(),
    _id: new ObjectId(),
    email: TEST_EMAIL,
    firstname: 'Test',
    surname: 'User',
    ...overrides,
  };

  const usersCollection = await mongoDbClient.getCollection('users');
  await usersCollection.insertOne(user);

  return user;
};

describe(`POST ${BASE_URL}`, () => {
  beforeEach(async () => {
    await wipe(['users']);
  });

  afterAll(async () => {
    await wipe(['users']);
  });

  it(`should respond with a ${HttpStatusCode.Created} and the remaining OTP send attempts for an active user`, async () => {
    const user = await insertUser();

    const response: SignInCodeResponse = await testApi.post({ user: { ...user, _id: user._id.toString() }, auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.Created);
    expect(response.body).toEqual({ signInOTPSendCount: OTP.MAX_SIGN_IN_ATTEMPTS - 1 });
  });

  it(`should respond with a ${HttpStatusCode.Created} and -1 and suspend the user once the maximum sign in OTP attempts are exceeded`, async () => {
    const user = await insertUser({ signInOTPSendCount: OTP.MAX_SIGN_IN_ATTEMPTS });

    const response: SignInCodeResponse = await testApi.post({ user: { ...user, _id: user._id.toString() }, auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.Created);
    expect(response.body).toEqual({ signInOTPSendCount: -1 });

    const usersCollection = await mongoDbClient.getCollection('users');
    const updatedUser = await usersCollection.findOne({ _id: { $eq: user._id } });

    expect(updatedUser?.['user-status']).toEqual(USER_STATUS.BLOCKED);
  });

  it(`should respond with a ${HttpStatusCode.Forbidden} when the user is blocked`, async () => {
    const user = await insertUser({ 'user-status': USER_STATUS.BLOCKED });

    const response: SignInCodeResponse = await testApi.post({ user: { ...user, _id: user._id.toString() }, auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.Forbidden);
    expect(response.body).toEqual({ message: 'User is blocked or disabled' });
  });

  it(`should respond with a ${HttpStatusCode.Forbidden} when the user is disabled`, async () => {
    const user = await insertUser({ disabled: true });

    const response: SignInCodeResponse = await testApi.post({ user: { ...user, _id: user._id.toString() }, auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.Forbidden);
    expect(response.body).toEqual({ message: 'User is blocked or disabled' });
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when the user is missing`, async () => {
    const response: SignInCodeResponse = await testApi.post({ auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.NotFound);
    expect(response.body).toEqual({ message: 'User or auditDetails not found' });
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when auditDetails is missing`, async () => {
    const response: SignInCodeResponse = await testApi.post({ user: aPortalUser() }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.NotFound);
    expect(response.body).toEqual({ message: 'User or auditDetails not found' });
  });
});
