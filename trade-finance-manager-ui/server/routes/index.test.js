import { use } from '../test-mocks/router-mock';
import loginRoutes from './login';
import caseRoutes from './case';
import dealsRoutes from './deals';

describe('routes index', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup all routes', () => {
    expect(use).toHaveBeenCalledTimes(3);
    expect(use).toHaveBeenCalledWith('/', loginRoutes);
    expect(use).toHaveBeenCalledWith('/case', caseRoutes);
    expect(use).toHaveBeenCalledWith('/deals', dealsRoutes);
  });
});
