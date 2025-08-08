import { dealTypeCoverStartDate } from './deal-type-cover-start-date';
import { MOCK_FACILITY } from '../test-helpers';

describe('dealTypeCoverStartDate()', () => {
  it('should return gef coverStartDate if provided', () => {
    const facilitySnapshot = {
      ...MOCK_FACILITY,
      coverStartDate: new Date('12/05/2022'),
    };

    const response = dealTypeCoverStartDate(facilitySnapshot);
    expect(response).toEqual(expect.any(Date));
  });

  it('should return bss coverStartDate constructed if no gef coverStartDate but requested coverStartDate split', () => {
    const facilitySnapshot = {
      ...MOCK_FACILITY,
      coverStartDate: null,
      'requestedCoverStartDate-year': 2022,
      'requestedCoverStartDate-month': 5,
      'requestedCoverStartDate-day': 12,
    };

    const response = dealTypeCoverStartDate(facilitySnapshot);
    expect(response).toEqual(expect.any(Date));
  });

  it('should return bss coverStartDate constructed if no gef coverStartDate but requested coverStartDate', () => {
    const facilitySnapshot = {
      ...MOCK_FACILITY,
      coverStartDate: null,
      requestedCoverStartDate: '12/05/2022',
    };

    const response = dealTypeCoverStartDate(facilitySnapshot);
    expect(response).toEqual(expect.any(Date));
  });
});
