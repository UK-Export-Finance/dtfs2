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
    expect(get).toHaveBeenCalledTimes(8);
    expect(get).toHaveBeenCalledWith('/:_id/deal', caseController.getCaseDeal);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId', caseController.getCaseFacility);
    expect(get).toHaveBeenCalledWith('/:_id/parties', caseController.getCaseParties);
  });
});
