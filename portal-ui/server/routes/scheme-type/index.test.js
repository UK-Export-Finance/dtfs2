import { get, post, use } from '@ukef/portal-ui/server/helpers/routerMock';

import { validateToken } from '@ukef/portal-ui/server/routes/middleware';

import { getSchemeType, postSchemeType } from '@ukef/portal-ui/server/controllers/schemeType';

jest.mock('../middleware/validate-token');
jest.mock('../middleware/is-maker');

describe('routes/site-notices', () => {
  describe('router', () => {
    beforeEach(() => {
      require('.');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should define the expected routes', () => {
      expect(use).toHaveBeenCalledWith('/select-scheme', validateToken);

      expect(get).toHaveBeenCalledWith('/select-scheme', [expect.any(Function), getSchemeType]);

      expect(post).toHaveBeenCalledWith('/select-scheme', [expect.any(Function), postSchemeType]);
    });
  });
});
