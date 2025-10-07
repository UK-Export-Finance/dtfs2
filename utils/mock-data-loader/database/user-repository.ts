import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import { PORTAL_LOGIN_STATUS, TIMEZONE, USER_STATUS, PortalUser, generatePasswordHash } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';

const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY ?? '', 'base64').toString('ascii');

export const createMockDataUser = async (user: PortalUser & { password: string }): Promise<boolean> => {
  try {
    const userCollection = await mongoDbClient.getCollection('users');
    const { password } = user;

    const { salt, hash } = generatePasswordHash(password);

    const insert = {
      ...user,
      salt,
      hash,
      'user-status': USER_STATUS.ACTIVE,
      timezone: TIMEZONE.DEFAULT,
    };

    await userCollection.insertOne(insert);

    console.info('\n\r✅ Successfully created the primary mock loader user.\n\r');

    return true;
  } catch (error) {
    throw new Error(`Failed to create mock data user ${user.username} ${String(error)}`);
    return false;
  }
};

/**
 * Generates a valid JSON Web Token (JWT) for a user with two-factor authentication (2FA).
 *
 * @param user - The user object containing necessary information for token generation.
 * @param sessionIdentifier - The session identifier associated with the user's session.
 * @returns A signed JWT representing the user's authenticated 2FA session.
 */
const issueValid2faJWT = (user: PortalUser, sessionIdentifier: string): string => {
  const { _id } = user;
  const payload = {
    sub: _id,
    sessionIdentifier,
    username: user.username,
    roles: user.roles,
    bank: user.bank,
    loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
  };

  return jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: '12hr', algorithm: 'RS256' });
};

/**
 * Creates a user session for a successfully logged-in user, updating the session identifier in the database
 * and generating a valid JWT token for two-factor authentication (2FA).
 *
 * @param  user - The user object representing the successfully logged-in user.
 * @returns  A promise that resolves to a string containing the JWT token with "Bearer" prefix,
 *                           representing the user's authenticated 2FA session.
 * @throws  Throws an error if there is a failure in creating the user session.
 */
export const createLoggedInUserSession = async (user: PortalUser): Promise<string> => {
  try {
    const userCollection = await mongoDbClient.getCollection('users');
    const userFromDatabase = await userCollection.findOne({ username: { $eq: user.username } }, { collation: { locale: 'en', strength: 2 } });

    if (!userFromDatabase) {
      throw new Error('User not found');
    }

    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const token = issueValid2faJWT(userFromDatabase, sessionIdentifier);
    await userCollection.updateOne({ _id: { $eq: userFromDatabase._id } }, { $set: { sessionIdentifier } });
    return `Bearer ${token}`;
  } catch (error) {
    throw new Error(`Failed to create logged in user session for user ${user.username} ${String(error)}`);
  }
};
