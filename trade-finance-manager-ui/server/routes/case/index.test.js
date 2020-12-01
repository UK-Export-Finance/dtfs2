import { get } from '../../test-mocks/router-mock';
import caseController from '../../controllers/case';

describe('routes - case', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    expect(get).toHaveBeenCalledWith('/deal/:_id', caseController.getCaseDeal);
  });
});
