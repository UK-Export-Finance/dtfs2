import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, isPortalFacilityAmendmentsFeatureFlagEnabled, ROLES } from '@ukef/dtfs2-common';
import { canIssuedFacilitiesBeAmended } from './canIssuedFacilitiesBeAmended.ts';

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;
const { UKEF_ACKNOWLEDGED, DRAFT } = DEAL_STATUS;
const { MAKER, ADMIN } = ROLES;

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

describe('canIssuedFacilitiesBeAmended', () => {
  describe('when `FF_PORTAL_FACILITY_AMENDMENTS_ENABLED` is set to false', () => {
    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(false);
    });

    it(`returns false`, () => {
      const result = canIssuedFacilitiesBeAmended(DEAL_SUBMISSION_TYPE.MIN, UKEF_ACKNOWLEDGED, [MAKER]);

      expect(result).toEqual(false);
    });
  });

  describe('when `FF_PORTAL_FACILITY_AMENDMENTS_ENABLED` is set to true', () => {
    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);
    });

    it(`returns false when the submission type is ${MIA}`, () => {
      const result = canIssuedFacilitiesBeAmended(MIA, UKEF_ACKNOWLEDGED, [MAKER]);

      expect(result).toEqual(false);
    });

    it(`returns false when the deal status is not ${UKEF_ACKNOWLEDGED}`, () => {
      const result = canIssuedFacilitiesBeAmended(MIN, DRAFT, [MAKER]);

      expect(result).toEqual(false);
    });

    it(`returns false when the user is not a ${MAKER}`, () => {
      const result = canIssuedFacilitiesBeAmended(MIN, DRAFT, [ADMIN]);

      expect(result).toEqual(false);
    });

    it(`returns true when the submission type is ${MIN}, the deal status is ${UKEF_ACKNOWLEDGED} and the user roles include ${MAKER}`, () => {
      const result = canIssuedFacilitiesBeAmended(MIN, UKEF_ACKNOWLEDGED, [MAKER]);

      expect(result).toEqual(true);
    });

    it(`returns true when the submission type is ${AIN}, the deal status is ${UKEF_ACKNOWLEDGED} and the user roles include ${MAKER}`, () => {
      const result = canIssuedFacilitiesBeAmended(AIN, UKEF_ACKNOWLEDGED, [MAKER]);

      expect(result).toEqual(true);
    });
  });
});
