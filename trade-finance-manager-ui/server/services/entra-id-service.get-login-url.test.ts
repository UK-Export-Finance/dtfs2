import { getLoginUrl } from './entra-id-service';

const mockedRedirectUrl = 'mock-redirect-url';

jest.mock('../configs/entra-id.config', () => ({
  ENTRA_ID_CONFIG: {
    REDIRECT_URL: 'mock-redirect-url',
  },
}));

describe('entra id service', () => {
  describe('getLoginUrl', () => {
    it('should return the redirect url', () => {
      expect(getLoginUrl()).toEqual(mockedRedirectUrl);
    });
  });
});
