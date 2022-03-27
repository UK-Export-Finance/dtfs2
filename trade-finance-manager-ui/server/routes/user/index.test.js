import { get, post } from '../../test-mocks/router-mock';
import userController from '../../controllers/user';

describe('routes - login', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    expect(get).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledTimes(1);

    expect(get).toHaveBeenCalledWith('/change-password', userController.getUserProfile);
    expect(post).toHaveBeenCalledWith('/change-password', userController.postUserProfile);
  });
});
