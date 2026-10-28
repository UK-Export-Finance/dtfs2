import { get, post, use } from '../../helpers/routerMock';

import { validateToken } from '../middleware';

import { getSchemeType, postSchemeType } from '../../controllers/schemeType';

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
