import { use } from '../test-mocks/router-mock';
import homeRoutes from './home';
import { loginRoutes } from './login';
import dealsRoutes from './deals';
import facilitiesRoutes from './facilities';
import feedbackRoutes from './feedback';
import feedbackThankYouRoutes from './feedback-thank-you';
import { userRoutes } from './user';
import { utilisationReportsRoutes } from './utilisation-reports';
import footerRoutes from './footer';
import { validateUser } from '../middleware/user-validation';

const mockCaseRoutes = jest.fn();
jest.mock('./case', () => mockCaseRoutes);

describe('routes index', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup all routes', () => {
    expect(use).toHaveBeenCalledTimes(10);
    expect(use).toHaveBeenCalledWith('/home', homeRoutes);
    expect(use).toHaveBeenCalledWith('/', loginRoutes);
    expect(use).toHaveBeenCalledWith('/case', validateUser, mockCaseRoutes);
    expect(use).toHaveBeenCalledWith('/deals', validateUser, dealsRoutes);
    expect(use).toHaveBeenCalledWith('/facilities', validateUser, facilitiesRoutes);
    expect(use).toHaveBeenCalledWith('/feedback', feedbackRoutes);
    expect(use).toHaveBeenCalledWith('/thank-you-feedback', feedbackThankYouRoutes);
    expect(use).toHaveBeenCalledWith('/user', userRoutes);
    expect(use).toHaveBeenCalledWith('/utilisation-reports', validateUser, utilisationReportsRoutes);
    expect(use).toHaveBeenCalledWith('/', footerRoutes);
  });
});
