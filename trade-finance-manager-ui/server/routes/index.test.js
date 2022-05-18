import { use } from '../test-mocks/router-mock';
import loginRoutes from './login';
import caseRoutes from './case';
import dealsRoutes from './deals';
import facilitiesRoutes from './facilities';
import feedbackRoutes from './feedback';
import feedbackThankYouRoutes from './feedback-thank-you';
import userRoutes from './user';
import footerRoutes from './footer';
import { validateUser } from '../middleware/user-validation';

describe('routes index', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup all routes', () => {
    expect(use).toHaveBeenCalledTimes(8);
    expect(use).toHaveBeenCalledWith('/', loginRoutes);
    expect(use).toHaveBeenCalledWith('/case', validateUser, caseRoutes);
    expect(use).toHaveBeenCalledWith('/deals', validateUser, dealsRoutes);
    expect(use).toHaveBeenCalledWith('/facilities', validateUser, facilitiesRoutes);
    expect(use).toHaveBeenCalledWith('/feedback', feedbackRoutes);
    expect(use).toHaveBeenCalledWith('/thank-you-feedback', feedbackThankYouRoutes);
    expect(use).toHaveBeenCalledWith('/user', userRoutes);
    expect(use).toHaveBeenCalledWith('/', footerRoutes);
  });
});
