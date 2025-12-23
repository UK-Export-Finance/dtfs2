import jsonwebtoken from 'jsonwebtoken';
import { PORTAL_LOGIN_STATUS, SESSION_EXPIRY, JWT_ALGORITHM, BUFFER_ENCODING, KEY_STRING_TYPE } from '../../constants';
import { PortalUser } from '../../types';

/**
 * Issues valid JWT for the user.
 * If no session identifier is found on the user, an error is thrown.
 * If no JWT signing key is found in environment variables, an error is thrown.
 * returns an object containing the token, its expiry, and the session identifier.
 * @param user - portal user object for the user signing in
 * @returns object containing the JWT token, its expiry, and the session identifier
 */
export const issueValid2FAJWT = (user: PortalUser) => {
  if (!user.sessionIdentifier) {
    throw new Error('User does not have a session identifier');
  }

  if (!process.env.JWT_SIGNING_KEY) {
    throw new Error('JWT signing key is not set in environment variables');
  }

  const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY, BUFFER_ENCODING).toString(KEY_STRING_TYPE);

  const { _id, sessionIdentifier } = user;

  const additionalPayload = {
    username: user.username,
    roles: user.roles,
    bank: user.bank,
    loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
  };

  const payload = {
    sub: _id,
    sessionIdentifier,
    ...additionalPayload,
  };

  const expiresIn = SESSION_EXPIRY;

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn, algorithm: JWT_ALGORITHM });

  return {
    token: `Bearer ${signedToken}`,
    expires: expiresIn,
    sessionIdentifier,
  };
};
