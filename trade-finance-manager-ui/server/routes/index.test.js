import { use } from '../test-mocks/router-mock';
import homeRoutes from './home';
import loginRoutes from './login';
import caseRoutes from './case';
import dealsRoutes from './deals';
import facilitiesRoutes from './facilities';
import feedbackRoutes from './feedback';
import feedbackThankYouRoutes from './feedback-thank-you';
import { utilisationReportsRoutes } from './utilisation-reports';
import footerRoutes from './footer';

const { validateUser, validateToken } = require('../middleware');

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
    expect(use).toHaveBeenCalledTimes(9);
    expect(use).toHaveBeenCalledWith('/home', validateToken, homeRoutes);
    expect(use).toHaveBeenCalledWith('/', loginRoutes);
    expect(use).toHaveBeenCalledWith('/case', validateUser, validateToken, caseRoutes);
    expect(use).toHaveBeenCalledWith('/deals', validateUser, validateToken, dealsRoutes);
    expect(use).toHaveBeenCalledWith('/facilities', validateUser, validateToken, facilitiesRoutes);
    expect(use).toHaveBeenCalledWith('/feedback', feedbackRoutes);
    expect(use).toHaveBeenCalledWith('/thank-you-feedback', feedbackThankYouRoutes);
    expect(use).toHaveBeenCalledWith('/utilisation-reports', validateUser, validateToken, utilisationReportsRoutes);
    expect(use).toHaveBeenCalledWith('/', footerRoutes);
  });
});
