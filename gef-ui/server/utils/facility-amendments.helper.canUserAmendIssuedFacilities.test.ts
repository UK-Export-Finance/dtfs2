import * as libs from '@ukef/dtfs2-common';
import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, isPortalFacilityAmendmentsFeatureFlagEnabled, ROLES } from '@ukef/dtfs2-common';
import { canUserAmendIssuedFacilities } from './facility-amendments.helper';

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;
const { UKEF_ACKNOWLEDGED, DRAFT, CANCELLED, CHANGES_REQUIRED } = DEAL_STATUS;
const { MAKER, CHECKER, ADMIN } = ROLES;

jest.mock('@ukef/dtfs2-common', (): typeof import('@ukef/dtfs2-common') => ({
  ...jest.requireActual<typeof libs>('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

describe('canUserAmendIssuedFacilities', () => {
  const submissionCount = 1;

  describe('when `FF_PORTAL_FACILITY_AMENDMENTS_ENABLED` is set to false', () => {
    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(false);
    });

    it(`should return false`, () => {
      const result = canUserAmendIssuedFacilities(DEAL_SUBMISSION_TYPE.MIN, UKEF_ACKNOWLEDGED, submissionCount, [MAKER]);

      expect(result).toEqual(false);
    });
  });

  describe('when `FF_PORTAL_FACILITY_AMENDMENTS_ENABLED` is set to true', () => {
    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);
    });

    it(`should return false when the submission type is ${MIA}`, () => {
      const result = canUserAmendIssuedFacilities(MIA, UKEF_ACKNOWLEDGED, submissionCount, [MAKER]);

      expect(result).toEqual(false);
    });

    it(`should return false when the deal status is not ${UKEF_ACKNOWLEDGED}`, () => {
      const result = canUserAmendIssuedFacilities(MIN, DRAFT, submissionCount, [MAKER]);

      expect(result).toEqual(false);
    });

    it(`should return false when the deal status is ${CANCELLED}`, () => {
      const result = canUserAmendIssuedFacilities(MIN, CANCELLED, submissionCount, [MAKER]);

      expect(result).toEqual(false);
    });

    it(`should return false when the user is not a ${MAKER}`, () => {
      const result = canUserAmendIssuedFacilities(MIN, UKEF_ACKNOWLEDGED, submissionCount, [ADMIN, CHECKER]);

      expect(result).toEqual(false);
    });

    it(`should return false when the submission count is 0`, () => {
      const result = canUserAmendIssuedFacilities(AIN, UKEF_ACKNOWLEDGED, 0, [MAKER]);

      expect(result).toEqual(false);
    });

    it(`should return true when the submission type is ${MIN}, the deal status is ${UKEF_ACKNOWLEDGED} and the user roles include ${MAKER}`, () => {
      const result = canUserAmendIssuedFacilities(MIN, UKEF_ACKNOWLEDGED, submissionCount, [MAKER, CHECKER, ADMIN]);

      expect(result).toEqual(true);
    });

    it(`should return true when the submission type is ${AIN}, the deal status is ${UKEF_ACKNOWLEDGED} and the user roles include ${MAKER}`, () => {
      const result = canUserAmendIssuedFacilities(AIN, UKEF_ACKNOWLEDGED, submissionCount, [MAKER]);

      expect(result).toEqual(true);
    });

    it(`should return true when the submission type is ${MIN}, the deal status is ${CHANGES_REQUIRED} and the user roles include ${MAKER}`, () => {
      const result = canUserAmendIssuedFacilities(MIN, CHANGES_REQUIRED, submissionCount, [MAKER, CHECKER, ADMIN]);

      expect(result).toEqual(true);
    });

    it(`should return true when the submission type is ${AIN}, the deal status is ${CHANGES_REQUIRED} and the user roles include ${MAKER}`, () => {
      const result = canUserAmendIssuedFacilities(AIN, CHANGES_REQUIRED, submissionCount, [MAKER]);

      expect(result).toEqual(true);
    });
  });
});
