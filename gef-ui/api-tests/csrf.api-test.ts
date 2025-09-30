import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { verify, AnyObject, ROLES } from '@ukef/dtfs2-common';
import * as libs from '@ukef/dtfs2-common';
import app from '../server/createApp';
import { createApi } from './create-api';
import * as storage from './test-helpers/storage/storage';

const { post } = createApi(app);
const url = '/mandatory-criteria';

function postWithSessionCookie(body: AnyObject, sessionCookie: string) {
  return post(body, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(url);
}

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof libs>('@ukef/dtfs2-common'),
  verify: jest.fn((req: Request, res: Response, next: NextFunction): void => next()),
}));

describe('csrf', () => {
  let sessionCookie: string;

  beforeEach(async () => {
    jest.resetAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
  });

  it(`should return ${HttpStatusCode.BadRequest} when the CSRF token is invalid`, async () => {
    // Arrange
    (verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid CSRF token');
    });
    const body = {};

    // Act
    const response = await postWithSessionCookie(body, sessionCookie);

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
    expect(response.text).toContain('Problem with the service');
  });

  it(`should return ${HttpStatusCode.BadRequest} when the CSRF token is invalid`, async () => {
    // Arrange
    (verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid CSRF token');
    });
    const body = {
      _csrf: 'invalid',
    };

    // Act
    const response = await postWithSessionCookie(body, sessionCookie);

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
    expect(response.text).toContain('Problem with the service');
  });

  it(`should return ${HttpStatusCode.Found} when the CSRF token is valid`, async () => {
    // Arrange
    (verify as jest.Mock).mockImplementation((req: Request, res: Response, next: NextFunction) => next());
    const body = {
      _csrf: 'valid:1234',
      mandatoryCriteria: true,
    };

    // Act
    const response = await postWithSessionCookie(body, sessionCookie);

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Found);
    expect(response.text).not.toContain('Problem with the service');
  });
});
