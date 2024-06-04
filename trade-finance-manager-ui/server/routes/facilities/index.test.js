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
    expect(get).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenCalledTimes(2);

    expect(get).toHaveBeenCalledWith('/', expect.any(Function));
    expect(get).toHaveBeenCalledWith('/:pageNumber', getFacilities);
    expect(post).toHaveBeenCalledWith('/', queryFacilities);
    expect(post).toHaveBeenCalledWith('/:pageNumber', queryFacilities);
  });
});
