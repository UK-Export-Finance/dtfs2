import { get, post } from '../../test-mocks/router-mock';
import caseController from '../../controllers/case';

describe('routes - case', () => {
  beforeEach(() => {
    require('./index');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    expect(get).toHaveBeenCalledWith('/case/deal/:_id', caseController.getCaseDeal);
  });
});
