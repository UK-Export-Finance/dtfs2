import { get, post } from '../../test-mocks/router-mock';
import loginController from '../../controllers/login';

describe('routes - login', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    require('./index'); // eslint-disable-line global-require
  });

  it('should setup routes with controllers', () => {
    expect(get).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenCalledTimes(0);

    expect(get.mock.calls[0]).toEqual(['/', loginController.getLogin]);
    expect(get.mock.calls[1]).toEqual(['/logout', loginController.logout]);

    // Route POST /login/sso/redirect is set in generateApp.js
  });
});
