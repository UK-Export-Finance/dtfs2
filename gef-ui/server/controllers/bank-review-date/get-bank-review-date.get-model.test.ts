import { Facility } from '../../types/facility';
import { getBankReviewDateViewModel } from './get-bank-review-date';

const previousPage = 'previousPage';
const dealId = 'dealId';
const facilityId = ' facilityId';
const status = 'change';

describe('getBankReviewDateViewModel', () => {
  it('returns the expected object when no existing bank review date', () => {
    const facility = {
      _id: facilityId,
      dealId,
      bankReviewDate: null,
    } as Facility;

    const result = getBankReviewDateViewModel(facility, previousPage, status);

    expect(result).toEqual({
      dealId,
      facilityId,
      previousPage,
      status,
    });
  });

  it('returns the expected object when there is an existing bank review date', () => {
    const facility = {
      _id: facilityId,
      dealId,
      bankReviewDate: '2024-09-09T10:14:08.621Z',
    } as Facility;

    const result = getBankReviewDateViewModel(facility, previousPage, status);

    expect(result).toEqual({
      dealId,
      facilityId,
      previousPage,
      status,
      bankReviewDate: {
        day: '9',
        month: '9',
        year: '2024',
      },
    });
  });
});
