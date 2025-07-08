import { PORTAL_AMENDMENT_STATUS, now } from '@ukef/dtfs2-common';
import { add } from 'date-fns';
import { addAmendmentParamsToFacility } from './add-amendment-params-to-facility';
import { MOCK_ISSUED_FACILITY } from '../utils/mocks/mock-facilities';
import { MOCK_CHECKER, MOCK_MAKER } from '../utils/mocks/mock-users';
import { PORTAL_AMENDMENT_PAGES } from '../constants/amendments';

const { AMENDMENT_DETAILS } = PORTAL_AMENDMENT_PAGES;

describe('addAmendmentParamsToFacility', () => {
  const amendmentReadyForChecker = {
    amendmentId: 'amendment-1',
    facilityId: 'facility-1',
    status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
    effectiveDate: now(),
  };

  const amendmentFurtherMakersInput = {
    amendmentId: 'amendment-1',
    facilityId: 'facility-2',
    status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
    effectiveDate: now(),
  };

  const amendmentAcknowledged = {
    amendmentId: 'amendment-1',
    facilityId: 'facility-1',
    status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
    effectiveDate: add(now(), { days: 1 }),
  };

  const facility = {
    ...MOCK_ISSUED_FACILITY.details,
    facilityId: 'facility-1',
  };

  const dealId = 'deal-1';

  const amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facility.facilityId}/amendments/${amendmentFurtherMakersInput.amendmentId}/${AMENDMENT_DETAILS}`;

  describe('when the amendment is ready for checkers approval', () => {
    const params = {
      facility,
      dealId: 'deal-1',
      isFacilityWithAmendmentInProgress: amendmentReadyForChecker,
    };

    describe('when the user is a maker', () => {
      it('should return return an object with correct variables', () => {
        const result = addAmendmentParamsToFacility({
          ...params,
          userRoles: MOCK_MAKER.roles,
          hasReadyForCheckerAmendments: false,
          hasFurtherMakersInputAmendments: false,
          readyForCheckerAmendmentDetailsUrlAndText: [],
          furtherMakersInputAmendmentDetailsUrlAndText: [],
        });

        const toAdd = {
          text: `Facility (${facility.ukefFacilityId}) amendment details`,
          amendmentDetailsUrl,
        };

        const expected = {
          mappedFacility: {
            ...facility,
            isFacilityWithAmendmentInProgress: amendmentReadyForChecker,
            amendmentDetailsUrl,
          },
          hasReadyForCheckerAmendments: true,
          hasFurtherMakersInputAmendments: false,
          readyForCheckerAmendmentDetailsUrlAndText: [toAdd],
          furtherMakersInputAmendmentDetailsUrlAndText: [],
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when the user is a checker', () => {
      it('should return return an object with correct variables', () => {
        const result = addAmendmentParamsToFacility({
          ...params,
          userRoles: MOCK_CHECKER.roles,
          hasReadyForCheckerAmendments: false,
          hasFurtherMakersInputAmendments: false,
          readyForCheckerAmendmentDetailsUrlAndText: [],
          furtherMakersInputAmendmentDetailsUrlAndText: [],
        });

        const toAdd = {
          text: `Facility (${facility.ukefFacilityId}) amendment details`,
          amendmentDetailsUrl,
        };

        const expected = {
          mappedFacility: {
            ...facility,
            isFacilityWithAmendmentInProgress: amendmentReadyForChecker,
            amendmentDetailsUrl,
          },
          hasReadyForCheckerAmendments: true,
          hasFurtherMakersInputAmendments: false,
          readyForCheckerAmendmentDetailsUrlAndText: [toAdd],
          furtherMakersInputAmendmentDetailsUrlAndText: [],
        };

        expect(result).toEqual(expected);
      });
    });
  });

  describe('when the amendment is further makers input', () => {
    const params = {
      facility,
      dealId: 'deal-1',
      isFacilityWithAmendmentInProgress: amendmentFurtherMakersInput,
    };

    describe('when the user is a maker', () => {
      it('should return return an object with correct variables', () => {
        const result = addAmendmentParamsToFacility({
          ...params,
          userRoles: MOCK_MAKER.roles,
          hasReadyForCheckerAmendments: false,
          hasFurtherMakersInputAmendments: false,
          readyForCheckerAmendmentDetailsUrlAndText: [],
          furtherMakersInputAmendmentDetailsUrlAndText: [],
        });

        const toAdd = {
          text: `Facility (${facility.ukefFacilityId}) amendment details`,
          amendmentDetailsUrl,
        };

        const expected = {
          mappedFacility: {
            ...facility,
            isFacilityWithAmendmentInProgress: amendmentFurtherMakersInput,
            amendmentDetailsUrl,
          },
          hasReadyForCheckerAmendments: false,
          hasFurtherMakersInputAmendments: true,
          readyForCheckerAmendmentDetailsUrlAndText: [],
          furtherMakersInputAmendmentDetailsUrlAndText: [toAdd],
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when the user is a checker', () => {
      it('should return return an object with correct variables', () => {
        const result = addAmendmentParamsToFacility({
          ...params,
          userRoles: MOCK_CHECKER.roles,
          hasReadyForCheckerAmendments: false,
          hasFurtherMakersInputAmendments: false,
          readyForCheckerAmendmentDetailsUrlAndText: [],
          furtherMakersInputAmendmentDetailsUrlAndText: [],
        });

        const expected = {
          mappedFacility: {
            ...facility,
            isFacilityWithAmendmentInProgress: amendmentFurtherMakersInput,
            amendmentDetailsUrl,
          },
          hasReadyForCheckerAmendments: false,
          hasFurtherMakersInputAmendments: false,
          readyForCheckerAmendmentDetailsUrlAndText: [],
          furtherMakersInputAmendmentDetailsUrlAndText: [],
        };

        expect(result).toEqual(expected);
      });
    });
  });

  describe('when the amendment is acknowledged', () => {
    const params = {
      facility,
      dealId: 'deal-1',
      isFacilityWithEffectiveAmendment: amendmentAcknowledged,
    };

    describe('when the user is a maker', () => {
      it('should return an object with correct variables', () => {
        const result = addAmendmentParamsToFacility({
          ...params,
          userRoles: MOCK_MAKER.roles,
          hasReadyForCheckerAmendments: false,
          hasFurtherMakersInputAmendments: false,
          readyForCheckerAmendmentDetailsUrlAndText: [],
          furtherMakersInputAmendmentDetailsUrlAndText: [],
        });

        const expected = {
          mappedFacility: {
            ...facility,
            isFacilityWithEffectiveAmendment: amendmentAcknowledged,
            amendmentDetailsUrl,
          },
          hasReadyForCheckerAmendments: false,
          hasFurtherMakersInputAmendments: false,
          readyForCheckerAmendmentDetailsUrlAndText: [],
          furtherMakersInputAmendmentDetailsUrlAndText: [],
        };

        expect(result).toEqual(expected);
      });
    });
  });
});
