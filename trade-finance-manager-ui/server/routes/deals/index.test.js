import { route } from '../../test-mocks/router-mock';

const { getDeals, queryDeals } = require('../../controllers/deals');

describe('routes - deals', () => {
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
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(queryDeals);

    expect(route).toHaveBeenCalledWith('/:pageNumber');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(getDeals);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(queryDeals);
  });
});
