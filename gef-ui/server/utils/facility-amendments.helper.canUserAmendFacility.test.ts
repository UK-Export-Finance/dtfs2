import * as dtfsCommon from '@ukef/dtfs2-common';
import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, ROLES } from '@ukef/dtfs2-common';
import { canUserAmendFacility } from './facility-amendments.helper';
import { Deal } from '../types/deal';
import { Facility } from '../types/facility';

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;
const { UKEF_ACKNOWLEDGED, DRAFT } = DEAL_STATUS;
const { MAKER, CHECKER, ADMIN } = ROLES;

const generateMockDeal = () =>
  ({
    submissionType: MIN,
    status: UKEF_ACKNOWLEDGED,
  }) as Deal;

const generateIssuedFacility = () =>
  ({
    hasBeenIssued: true,
  }) as Facility;

describe('canUserAmendFacility', () => {
  describe('when `FF_PORTAL_FACILITY_AMENDMENTS_ENABLED` is set to false', () => {
    beforeEach(() => {
      jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(false);
    });

    it(`should return false`, () => {
      const deal = generateMockDeal();
      const facility = generateIssuedFacility();
      const userRoles = [MAKER];

      const result = canUserAmendFacility(facility, deal, userRoles);

      expect(result).toEqual(false);
    });
  });

  describe('when `FF_PORTAL_FACILITY_AMENDMENTS_ENABLED` is set to true', () => {
    beforeEach(() => {
      jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    });

    it(`should return false when the submission type is ${MIA}`, () => {
      const deal = { ...generateMockDeal(), submissionType: MIA };
      const facility = generateIssuedFacility();
      const userRoles = [MAKER];

      const result = canUserAmendFacility(facility, deal, userRoles);

      expect(result).toEqual(false);
    });

    it(`should return false when the deal status is not ${UKEF_ACKNOWLEDGED}`, () => {
      const deal = { ...generateMockDeal(), status: DRAFT };
      const facility = generateIssuedFacility();
      const userRoles = [MAKER];

      const result = canUserAmendFacility(facility, deal, userRoles);

      expect(result).toEqual(false);
    });

    it(`should return false when the user is not a ${MAKER}`, () => {
      const deal = generateMockDeal();
      const facility = generateIssuedFacility();
      const userRoles = [ADMIN, CHECKER];

      const result = canUserAmendFacility(facility, deal, userRoles);

      expect(result).toEqual(false);
    });

    it(`should return false when the facility has not been issued`, () => {
      const deal = generateMockDeal();
      const facility = { ...generateIssuedFacility(), hasBeenIssued: false };
      const userRoles = [MAKER];

      const result = canUserAmendFacility(facility, deal, userRoles);

      expect(result).toEqual(false);
    });

    it(`should return true when the submission type is ${MIN} and everything else is valid`, () => {
      const deal = { ...generateMockDeal(), submissionType: MIN, status: UKEF_ACKNOWLEDGED };
      const facility = generateIssuedFacility();
      const userRoles = [MAKER, CHECKER, ADMIN];

      const result = canUserAmendFacility(facility, deal, userRoles);

      expect(result).toEqual(true);
    });

    it(`should return true when the submission type is ${AIN} and everything else is valid`, () => {
      const deal = { ...generateMockDeal(), submissionType: AIN, status: UKEF_ACKNOWLEDGED };
      const facility = generateIssuedFacility();
      const userRoles = [MAKER];

      const result = canUserAmendFacility(facility, deal, userRoles);

      expect(result).toEqual(true);
    });
  });
});
