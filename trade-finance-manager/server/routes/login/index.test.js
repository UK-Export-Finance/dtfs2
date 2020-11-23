import { get, post } from '../../test-mocks/router-mock';
import loginController from '../../controllers/login';

describe('routes - login', () => {
  beforeEach(() => {
    require('./index');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    expect(get).toHaveBeenCalledWith('/', loginController.getLogin);
    expect(post).toHaveBeenCalledWith('/', loginController.postLogin);
  });
});
