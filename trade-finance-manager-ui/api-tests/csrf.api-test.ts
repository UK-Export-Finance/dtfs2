import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { verify, AnyObject } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/test-helpers';
import * as libs from '@ukef/dtfs2-common';
import app from '../server/createApp';

const { post } = createApi(app);
const url = '/';

function postWithSessionCookie(body: AnyObject) {
  return post(body).to(url);
}

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof libs>('@ukef/dtfs2-common'),
  verify: jest.fn((req: Request, res: Response, next: NextFunction): void => next()),
}));

describe('csrf', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it(`should return ${HttpStatusCode.BadRequest} when the CSRF token is invalid`, async () => {
    // Arrange
    (verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid CSRF token');
    });
    const body = {};

    // Act
    const response = await postWithSessionCookie(body);

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
    const response = await postWithSessionCookie(body);

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
    expect(response.text).toContain('Problem with the service');
  });

  it(`should return ${HttpStatusCode.Ok} when the CSRF token is valid`, async () => {
    // Arrange
    (verify as jest.Mock).mockImplementation((req: Request, res: Response, next: NextFunction) => next());
    const body = {
      _csrf: 'valid:1234',
    };

    // Act
    const response = await postWithSessionCookie(body);

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.text).not.toContain('Problem with the service');
  });
});
