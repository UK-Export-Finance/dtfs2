import { route } from '../../test-mocks/router-mock';

const { getFacilities, queryFacilities } = require('../../controllers/facilities');

describe('routes - facilities', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    expect(route).toHaveBeenCalledTimes(2);

    expect(route).toHaveBeenCalledWith('/');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(expect.any(Function));
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(queryFacilities);

    expect(route).toHaveBeenCalledWith('/:pageNumber');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(getFacilities);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(queryFacilities);
  });
});
