import { get, post } from '../../test-mocks/router-mock';

const { getDeals, queryDeals } = require('../../controllers/deals');

describe('routes - deals', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    expect(get).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledTimes(1);

    expect(get).toHaveBeenCalledWith('/', getDeals);
    expect(post).toHaveBeenCalledWith('/', queryDeals);
  });
});
