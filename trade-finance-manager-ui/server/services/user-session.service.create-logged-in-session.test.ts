import { TfmSessionUser } from '@ukef/dtfs2-common';
import { Cookie, Session, SessionData } from 'express-session';
import { UserSessionService } from './user-session.service';
import { aTfmSessionUser } from '../../test-helpers';
import { PartiallyLoggedInUserSessionData } from '../types/express-session';

describe('user session service', () => {
  describe('createLoggedInSession', () => {
    let userSessionService: UserSessionService;
    let tfmSessionUser: TfmSessionUser;
    let userToken: string;
    let session: Session & Partial<SessionData>;

    beforeEach(() => {
      userSessionService = new UserSessionService();

      jest.resetAllMocks();

      tfmSessionUser = aTfmSessionUser();
      userToken = 'a-token';

      const partiallyLoggedInUserSessionData = {
        loginData: 'some-login-data',
      } as unknown as PartiallyLoggedInUserSessionData;

      session = {
        ...partiallyLoggedInUserSessionData,
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
      userSessionService.createLoggedInSession({ session, user: tfmSessionUser, userToken });

      // Assert
      expect(session.loginData).toBeUndefined();
    });

    it('sets session.user to user', () => {
      // Act
      userSessionService.createLoggedInSession({ session, user: tfmSessionUser, userToken });

      // Assert
      expect(session.user).toEqual(tfmSessionUser);
    });

    it('sets session.userToken to userToken', () => {
      // Act
      userSessionService.createLoggedInSession({ session, user: tfmSessionUser, userToken });

      // Assert
      expect(session.userToken).toEqual(userToken);
    });
  });
});
