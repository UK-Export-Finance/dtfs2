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
    expect(get).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenCalledTimes(2);

    expect(get).toHaveBeenCalledWith('/', expect.any(Function));
    expect(get).toHaveBeenCalledWith('/:pageNumber', getDeals);
    expect(post).toHaveBeenCalledWith('/', queryDeals);
    expect(post).toHaveBeenCalledWith('/:pageNumber', queryDeals);
  });
});
