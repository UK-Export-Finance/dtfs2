import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, USER_STATUS, PortalUser } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { generateOtp } from '../../../server/helpers/portal-2fa/generate-otp';
import { insertPortalUser } from '../../helpers/portal-users';

const BASE_URL = '/v1/portal/users/me/validate-sign-in-code';

type ValidateSignInCodeSuccessBody = {
  success: true;
  user: PortalUser;
  tokenObject: { token: string; expires: string };
};

type ValidateSignInCodeBody =
  | ValidateSignInCodeSuccessBody
  | { success: false; isInvalid: true }
  | { success: false; isExpired: true }
  | { success: false; notFound: true }
  | { message: string };

/**
 * Narrows a validate-sign-in-code response body to the successful sign in shape.
 */
const isSuccessBody = (body: ValidateSignInCodeBody): body is ValidateSignInCodeSuccessBody => 'success' in body && body.success === true;

/**
 * Posts to the validate-sign-in-code route, returning a response with a concretely typed body.
 */
const postValidateSignInCode = async (data: object): Promise<{ status: number; body: ValidateSignInCodeBody }> => {
  const response = await testApi.post(data).to(BASE_URL);

  return { status: response.status, body: response.body as ValidateSignInCodeBody };
};

/**
 * Inserts a portal user document directly into the `users` collection.
 * A `sessionIdentifier` is set by default as `issueValid2FAJWT` requires one to already exist on the user.
 */
const insertUser = (overrides: Partial<PortalUser> = {}): Promise<PortalUser> =>
  insertPortalUser({ sessionIdentifier: 'a-test-session-identifier', ...overrides });

describe(`POST ${BASE_URL}`, () => {
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await wipeDB.wipe([MONGO_DB_COLLECTIONS.USERS]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.USERS]);
  });

  describe('when the OTP is valid', () => {
    it(`should respond with ${HttpStatusCode.Ok}, the user, and a token`, async () => {
      const { securityCode, salt: saltHex, hash: hashHex, expiry } = generateOtp();
      const user = await insertUser({ signInTokens: [{ hashHex, saltHex, expiry }] });

      const { status, body } = await postValidateSignInCode({
        userId: user._id.toString(),
        signInOTPCode: securityCode,
        auditDetails: generatePortalAuditDetails(user._id),
      });

      expect(status).toEqual(HttpStatusCode.Ok);

      if (!isSuccessBody(body)) {
        throw new Error(`Expected a successful sign in response but received ${JSON.stringify(body)}`);
      }

      expect(body.user._id).toEqual(user._id.toString());
      expect(body.tokenObject.token).toEqual(expect.any(String));
    });
  });

  describe('when the OTP code is incorrect', () => {
    it(`should respond with ${HttpStatusCode.Unauthorized}`, async () => {
      const { securityCode, salt: saltHex, hash: hashHex, expiry } = generateOtp();
      const incorrectCode = securityCode === '000000' ? '111111' : '000000';
      const user = await insertUser({ signInTokens: [{ hashHex, saltHex, expiry }] });

      const { status, body } = await postValidateSignInCode({
        userId: user._id.toString(),
        signInOTPCode: incorrectCode,
        auditDetails: generatePortalAuditDetails(user._id),
      });

      expect(status).toEqual(HttpStatusCode.Unauthorized);
      expect(body).toMatchObject({ success: false, isInvalid: true });
    });
  });

  describe('when the OTP has expired', () => {
    it(`should respond with ${HttpStatusCode.Unauthorized}`, async () => {
      const { securityCode, salt: saltHex, hash: hashHex } = generateOtp();
      const expiredExpiry = Date.now() - 1000;
      const user = await insertUser({ signInTokens: [{ hashHex, saltHex, expiry: expiredExpiry }] });

      const { status, body } = await postValidateSignInCode({
        userId: user._id.toString(),
        signInOTPCode: securityCode,
        auditDetails: generatePortalAuditDetails(user._id),
      });

      expect(status).toEqual(HttpStatusCode.Unauthorized);
      expect(body).toMatchObject({ success: false, isExpired: true });
    });
  });

  describe('when the user has no sign in tokens', () => {
    it(`should respond with ${HttpStatusCode.NotFound}`, async () => {
      const user = await insertUser({ signInTokens: [] });

      const { status, body } = await postValidateSignInCode({
        userId: user._id.toString(),
        signInOTPCode: '123456',
        auditDetails: generatePortalAuditDetails(user._id),
      });

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({ message: 'User not found' });
    });
  });

  describe('when the user is blocked or disabled', () => {
    it(`should respond with ${HttpStatusCode.Forbidden}`, async () => {
      const { securityCode, hash: hashHex, salt: saltHex, expiry } = generateOtp();
      const user = await insertUser({ 'user-status': USER_STATUS.BLOCKED, signInTokens: [{ hashHex, saltHex, expiry }] });

      const { status, body } = await postValidateSignInCode({
        userId: user._id.toString(),
        signInOTPCode: securityCode,
        auditDetails: generatePortalAuditDetails(user._id),
      });

      expect(status).toEqual(HttpStatusCode.Forbidden);
      expect(body).toEqual({ message: 'User is blocked or disabled' });
    });
  });

  describe('when the user does not exist', () => {
    // TODO (DTFS2-8249): `getUserById` currently throws (rather than returning null) when no user is found, so this
    // route responds with 500 instead of the 404 documented in its OpenAPI spec - see DTFS2-8249.
    // This test intentionally locks in that current behaviour, so it will start failing once
    // DTFS2-8249 is fixed - at that point, replace it with the `it.todo` below.
    it(`should respond with ${HttpStatusCode.InternalServerError}`, async () => {
      const nonExistentUserId = new ObjectId();

      const { status } = await postValidateSignInCode({
        userId: nonExistentUserId.toString(),
        signInOTPCode: '123456',
        auditDetails: generatePortalAuditDetails(nonExistentUserId),
      });

      expect(status).toEqual(HttpStatusCode.InternalServerError);
    });

    // TODO (DTFS2-8249): once `getUserById` returns null instead of throwing for a non-existent user,
    // remove the test above and un-skip/implement this one to assert the documented 404 behaviour.
    it.todo(`should respond with ${HttpStatusCode.NotFound}`);
  });
});
