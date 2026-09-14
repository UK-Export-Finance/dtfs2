import { HttpStatusCode } from 'axios';
import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, OTP, USER_STATUS } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { aPortalUser } from '../../../test-helpers';
import { insertPortalUser as insertUser, getPortalUser as getUser } from '../../helpers/portal-users';

const BASE_URL = '/v1/portal/users/me/sign-in-code';

interface SignInCodeResponse extends Response {
  body: { signInOTPSendCount?: number; message?: string };
}

describe(`POST ${BASE_URL}`, () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.USERS]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.USERS]);
  });

  describe('when the user is valid and active', () => {
    it(`should respond with ${HttpStatusCode.Created} and the signInOTPSendCount`, async () => {
      const user = await insertUser();

      const { status, body } = (await testApi.post({ user, auditDetails: generatePortalAuditDetails(user._id) }).to(BASE_URL)) as SignInCodeResponse;

      expect(status).toEqual(HttpStatusCode.Created);
      expect(body).toEqual({ signInOTPSendCount: OTP.MAX_SIGN_IN_ATTEMPTS - 1 });
    });
  });

  describe('when the maximum number of sign in OTPs has been exceeded', () => {
    it(`should respond with ${HttpStatusCode.Created}, a signInOTPSendCount of -1, and block the user`, async () => {
      const user = await insertUser({ signInOTPSendCount: OTP.MAX_SIGN_IN_ATTEMPTS, signInOTPSendDate: Date.now() });
      const auditDetails = generatePortalAuditDetails(user._id);

      const { status, body } = (await testApi.post({ user, auditDetails }).to(BASE_URL)) as SignInCodeResponse;

      expect(status).toEqual(HttpStatusCode.Created);
      expect(body).toEqual({ signInOTPSendCount: -1 });

      const updatedUser = await getUser(user._id);

      expect(updatedUser['user-status']).toEqual(USER_STATUS.BLOCKED);
    });
  });

  describe('when the user is blocked or disabled', () => {
    it(`should respond with ${HttpStatusCode.Forbidden}`, async () => {
      const user = await insertUser({ 'user-status': USER_STATUS.BLOCKED });

      const { status, body } = (await testApi.post({ user, auditDetails: generatePortalAuditDetails(user._id) }).to(BASE_URL)) as SignInCodeResponse;

      expect(status).toEqual(HttpStatusCode.Forbidden);
      expect(body).toEqual({ message: 'User is blocked or disabled' });
    });
  });

  describe('when the user is missing from the request body', () => {
    it(`should respond with ${HttpStatusCode.NotFound}`, async () => {
      const { status, body } = (await testApi.post({ auditDetails: generatePortalAuditDetails(new ObjectId()) }).to(BASE_URL)) as SignInCodeResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({ message: 'User or auditDetails not found' });
    });
  });

  describe('when auditDetails is missing from the request body', () => {
    it(`should respond with ${HttpStatusCode.NotFound}`, async () => {
      const user = aPortalUser();

      const { status, body } = (await testApi.post({ user }).to(BASE_URL)) as SignInCodeResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({ message: 'User or auditDetails not found' });
    });
  });
});
