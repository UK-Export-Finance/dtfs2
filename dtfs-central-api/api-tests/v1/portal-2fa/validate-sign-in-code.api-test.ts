import { ObjectId } from 'mongodb';
import { Response } from 'supertest';
import { HttpStatusCode } from 'axios';
import { USER_STATUS, PortalUser, SignInTokens } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../test-helpers';
import { testApi } from '../../test-api';
import { wipe } from '../../wipeDB';
import { mongoDbClient } from '../../../server/drivers/db-client';
import { generateOtp } from '../../../server/helpers/portal-2fa/generate-otp';

const BASE_URL = '/v1/portal/users/me/validate-sign-in-code';

interface ValidateSignInCodeResponse extends Response {
  body: {
    success?: boolean;
    isValid?: boolean;
    isExpired?: boolean;
    isInvalid?: boolean;
    notFound?: boolean;
    statusCode?: number;
    message?: string;
    user?: PortalUser;
    tokenObject?: { token: string; expires: string };
  };
}

const auditDetails = generatePortalAuditDetails(new ObjectId());

const insertUser = async (overrides: Partial<PortalUser> = {}): Promise<PortalUser> => {
  const user: PortalUser = {
    ...aPortalUser(),
    _id: new ObjectId(),
    ...overrides,
  };

  const usersCollection = await mongoDbClient.getCollection('users');
  await usersCollection.insertOne(user);

  return user;
};

/**
 * Generates a real OTP and its corresponding sign in token, so that the code
 * can be successfully verified against the stored hash by the endpoint under test.
 */
const generateValidSignInOtp = (): { securityCode: string; signInToken: SignInTokens } => {
  const { securityCode, salt, hash, expiry } = generateOtp();

  return { securityCode, signInToken: { saltHex: salt, hashHex: hash, expiry } };
};

describe(`POST ${BASE_URL}`, () => {
  beforeEach(async () => {
    await wipe(['users']);
  });

  afterAll(async () => {
    await wipe(['users']);
  });

  it(`should respond with a ${HttpStatusCode.Ok} and sign in the user when the OTP is valid`, async () => {
    const { securityCode, signInToken } = generateValidSignInOtp();
    const user = await insertUser({ signInTokens: [signInToken], sessionIdentifier: 'existing-session-identifier' });

    const response: ValidateSignInCodeResponse = await testApi.post({ userId: user._id.toString(), signInOTPCode: securityCode, auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body.success).toEqual(true);
    expect(response.body.user?._id.toString()).toEqual(user._id.toString());
    expect(response.body.tokenObject?.token).toEqual(expect.stringContaining('Bearer '));

    const usersCollection = await mongoDbClient.getCollection('users');
    const updatedUser = await usersCollection.findOne({ _id: { $eq: user._id } });

    expect(updatedUser?.signInTokens).toEqual([]);
    expect(updatedUser?.signInOTPSendCount).toEqual(0);
  });

  it(`should respond with a ${HttpStatusCode.Unauthorized} when the OTP is incorrect`, async () => {
    const { signInToken } = generateValidSignInOtp();
    const user = await insertUser({ signInTokens: [signInToken] });

    const response: ValidateSignInCodeResponse = await testApi.post({ userId: user._id.toString(), signInOTPCode: '000000', auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.Unauthorized);
    expect(response.body).toEqual({ success: false, isInvalid: true, statusCode: HttpStatusCode.Unauthorized });
  });

  it(`should respond with a ${HttpStatusCode.Unauthorized} when the OTP has expired`, async () => {
    const { securityCode, signInToken } = generateValidSignInOtp();
    const expiredSignInToken: SignInTokens = { ...signInToken, expiry: Date.now() - 1 };
    const user = await insertUser({ signInTokens: [expiredSignInToken] });

    const response: ValidateSignInCodeResponse = await testApi.post({ userId: user._id.toString(), signInOTPCode: securityCode, auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.Unauthorized);
    expect(response.body).toEqual({ success: false, isExpired: true, statusCode: HttpStatusCode.Unauthorized });
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when the user has no sign in tokens`, async () => {
    const user = await insertUser({ signInTokens: [] });

    const response: ValidateSignInCodeResponse = await testApi.post({ userId: user._id.toString(), signInOTPCode: '123456', auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.NotFound);
    expect(response.body).toEqual({ message: 'User not found' });
  });

  it(`should respond with a ${HttpStatusCode.Forbidden} when the user is blocked`, async () => {
    const { securityCode, signInToken } = generateValidSignInOtp();
    const user = await insertUser({ signInTokens: [signInToken], 'user-status': USER_STATUS.BLOCKED });

    const response: ValidateSignInCodeResponse = await testApi.post({ userId: user._id.toString(), signInOTPCode: securityCode, auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.Forbidden);
    expect(response.body).toEqual({ message: 'User is blocked or disabled' });
  });

  it(`should respond with a ${HttpStatusCode.Forbidden} when the user is disabled`, async () => {
    const { securityCode, signInToken } = generateValidSignInOtp();
    const user = await insertUser({ signInTokens: [signInToken], disabled: true });

    const response: ValidateSignInCodeResponse = await testApi.post({ userId: user._id.toString(), signInOTPCode: securityCode, auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.Forbidden);
    expect(response.body).toEqual({ message: 'User is blocked or disabled' });
  });

  /**
   * NOTE: `getUserById` currently throws (rather than returning null) when no user is found,
   * which is caught by the controller's top level try/catch and surfaced as a 500.
   * This is a known, pre-existing bug (DTFS2-8249) - the endpoint's documented behaviour is a
   * 404, but the actual current behaviour is a 500. This test asserts the actual behaviour, and
   * should be updated to expect a 404 once DTFS2-8249 is fixed.
   */
  it(`should respond with a ${HttpStatusCode.InternalServerError} when the user does not exist (see DTFS2-8249)`, async () => {
    const nonExistentUserId = new ObjectId().toString();

    const response: ValidateSignInCodeResponse = await testApi.post({ userId: nonExistentUserId, signInOTPCode: '123456', auditDetails }).to(BASE_URL);

    expect(response.status).toEqual(HttpStatusCode.InternalServerError);
    expect(response.body).toEqual({ message: `Failed to find user with id ${nonExistentUserId}` });
  });
});
