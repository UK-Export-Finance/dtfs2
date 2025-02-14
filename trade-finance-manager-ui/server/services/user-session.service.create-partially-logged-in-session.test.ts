import { Cookie, Session, SessionData } from 'express-session';
import { AuthorizationUrlRequest } from '@azure/msal-node';
import { UserSessionService } from './user-session.service';
import { aTfmSessionUser } from '../../test-helpers';
import { UserSessionData } from '../types/express-session';

describe('user session service', () => {
  describe('createPartiallyLoggedInSession', () => {
    let userSessionService: UserSessionService;
    let authCodeUrlRequest: AuthorizationUrlRequest;
    let session: Session & Partial<SessionData>;
    let userSessionData: UserSessionData;

    beforeEach(() => {
      userSessionService = new UserSessionService();

      jest.resetAllMocks();

      authCodeUrlRequest = 'mock-auth-code-url-request' as unknown as AuthorizationUrlRequest;

      userSessionData = {
        user: aTfmSessionUser(),
        userToken: 'a-token',
      };

      session = {
        ...userSessionData,
        id: 'mock-id',
        cookie: {} as Cookie,
        regenerate: jest.fn(),
        destroy: jest.fn(),
        reload: jest.fn(),
        save: jest.fn(),
        touch: jest.fn(),
        resetMaxAge: jest.fn(),
      };
    });

    it('deletes existing partially logged in session', () => {
      // Act
      userSessionService.createPartiallyLoggedInSession({ session, authCodeUrlRequest });

      // Assert
      expect(session.user).toBeUndefined();
      expect(session.userToken).toBeUndefined();
    });

    it('sets session.loginData to the login data', () => {
      // Act
      userSessionService.createPartiallyLoggedInSession({ session, authCodeUrlRequest });

      // Assert
      expect(session.loginData).toEqual({ authCodeUrlRequest });
    });
  });
});
