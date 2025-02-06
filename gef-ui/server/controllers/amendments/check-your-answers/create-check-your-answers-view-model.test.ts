import { DEAL_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { createCheckYourAnswersViewModel } from './create-check-your-answers-view-model';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { Deal } from '../../../types/deal';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { mapAmendmentToAmendmentSummaryListParams } from '../helpers/amendment-summary-view-model.helper';

describe('createCheckYourAnswersViewModel', () => {
  it('returns the expected view model', () => {
    // Arrange
    const deal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
    const facility = MOCK_ISSUED_FACILITY.details;
    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().build();

    // Act
    const result = createCheckYourAnswersViewModel({ amendment, facility, deal });

    // Assert
    const expected = {
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      cancelUrl: getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS, amendment),
      amendmentSummaryListParams: mapAmendmentToAmendmentSummaryListParams(amendment),
    };
    expect(result).toEqual(expected);
  });
});
