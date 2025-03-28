import { DEAL_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { createAmendmentDetailsViewModel } from './create-amendment-details-view-model';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { Deal } from '../../../types/deal';
import { mapAmendmentToAmendmentSummaryListParams } from '../helpers/amendment-summary-view-model.helper';

describe('createAmendmentDetailsViewModel', () => {
  it('should return the expected view model', () => {
    // Arrange
    const deal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
    const facility = MOCK_ISSUED_FACILITY.details;
    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().build();

    // Act
    const result = createAmendmentDetailsViewModel({ amendment, facility, deal });

    // Assert
    const expected = {
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      previousPage: `/gef/application-details/${deal._id}`,
      amendmentSummaryListParams: mapAmendmentToAmendmentSummaryListParams(amendment, false),
    };

    expect(result).toEqual(expected);
  });
});
