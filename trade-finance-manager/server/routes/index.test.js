import { use } from '../test-mocks/router-mock';
import loginRoutes from './login';
import caseRoutes from './case';

describe('routes index', () => {
  beforeEach(() => {
    require('./index');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup all routes', () => {
    expect(use).toHaveBeenCalledWith('/', loginRoutes);
    expect(use).toHaveBeenCalledWith('/case', caseRoutes);
    expect(use).toHaveBeenCalledTimes(2);
  });
});
