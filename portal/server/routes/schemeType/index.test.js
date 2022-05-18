import { get, post, use } from '../../helpers/routerMock';

import { validateToken } from '../middleware';

import { getSchemeType, postSchemeType } from '../../controllers/schemeType';

jest.mock('../middleware/validateToken');
jest.mock('../middleware/isMaker');

describe('routes/site-notices', () => {
  describe('router', () => {
    beforeEach(() => {
      // eslint-disable-next-line global-require
      require('.');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should define the expected routes', () => {
      expect(use).toHaveBeenCalledWith('/select-scheme/*', [validateToken, expect.any(Function)]);

      expect(get).toHaveBeenCalledWith('/select-scheme', getSchemeType);

      expect(post).toHaveBeenCalledWith('/select-scheme', postSchemeType);
    });
  });
});
