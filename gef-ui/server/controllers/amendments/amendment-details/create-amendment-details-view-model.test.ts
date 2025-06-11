import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_AMENDMENT_STATUS, ROLES } from '@ukef/dtfs2-common';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { createAmendmentDetailsViewModel } from './create-amendment-details-view-model';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { Deal } from '../../../types/deal';
import { mapAmendmentToAmendmentSummaryListParams } from '../helpers/amendment-summary-view-model.helper';

const users = [ROLES.MAKER, ROLES.CHECKER];

users.forEach((user) => {
  describe(`createAmendmentDetailsViewModel for user role ${user}`, () => {
    it('should return the expected view model', () => {
      // Arrange
      const deal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
      const facility = MOCK_ISSUED_FACILITY.details;
      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().build();
      const userRoles = [user];
      const banner = true;
      const canAbandonFacilityAmendment = userRoles.includes(ROLES.MAKER) && amendment.status === PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED;

      // Act
      const result = createAmendmentDetailsViewModel({ amendment, facility, deal, userRoles, banner });

      // Assert
      const expected = {
        userRoles,
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        submitAmendment: userRoles.includes('checker'),
        dealId: deal._id,
        facilityId: facility._id,
        amendmentId: amendment.amendmentId,
        effectiveDate: '',
        banner,
        canAbandonFacilityAmendment,
        previousPage: `/gef/application-details/${deal._id}`,
        amendmentSummaryListParams: mapAmendmentToAmendmentSummaryListParams(amendment, facility, false),
      };

      expect(result).toEqual(expected);
    });
  });
});
