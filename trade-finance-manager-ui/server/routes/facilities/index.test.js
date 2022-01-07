import { get, post } from '../../test-mocks/router-mock';

const { getFacilities, queryFacilities } = require('../../controllers/facilities');

describe('routes - facilities', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    expect(get).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledTimes(1);

    expect(get).toHaveBeenCalledWith('/', getFacilities);
    expect(post).toHaveBeenCalledWith('/', queryFacilities);
  });
});
