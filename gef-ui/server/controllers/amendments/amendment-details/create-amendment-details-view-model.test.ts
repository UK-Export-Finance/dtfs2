import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_AMENDMENT_STATUS, ROLES } from '@ukef/dtfs2-common';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { createAmendmentDetailsViewModel } from './create-amendment-details-view-model';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { Deal } from '../../../types/deal';
import { mapAmendmentToAmendmentSummaryListParams } from '../helpers/amendment-summary-view-model.helper';

const deal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
const facility = MOCK_ISSUED_FACILITY.details;
const banner = false;

describe(`createAmendmentDetailsViewModel for user role ${ROLES.MAKER}`, () => {
  it(`should return the expected view model when portal amendment status is ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, () => {
    // Arrange
    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL).build();
    const userRoles = [ROLES.MAKER];
    const canSubmitFacilityAmendmentToChecker = userRoles.includes(ROLES.MAKER) && amendment.status === PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED;

    // Act
    const result = createAmendmentDetailsViewModel({ amendment, facility, deal, userRoles, banner });

    // Assert
    const expected = {
      userRoles,
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      submitAmendment: false,
      dealId: deal._id,
      facilityId: facility._id,
      amendmentId: amendment.amendmentId,
      effectiveDate: '',
      banner,
      canSubmitFacilityAmendmentToChecker,
      previousPage: `/gef/application-details/${deal._id}`,
      amendmentSummaryListParams: mapAmendmentToAmendmentSummaryListParams(amendment, facility, false),
    };

    expect(result).toEqual(expected);
  });

  it(`should return the expected view model when portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED}`, () => {
    // Arrange
    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED).build();
    const userRoles = [ROLES.MAKER];
    const canSubmitFacilityAmendmentToChecker = userRoles.includes(ROLES.MAKER) && amendment.status === PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED;

    // Act
    const result = createAmendmentDetailsViewModel({ amendment, facility, deal, userRoles, banner });

    // Assert
    const expected = {
      userRoles,
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      submitAmendment: false,
      dealId: deal._id,
      facilityId: facility._id,
      amendmentId: amendment.amendmentId,
      effectiveDate: '',
      banner,
      canSubmitFacilityAmendmentToChecker,
      previousPage: `/gef/application-details/${deal._id}`,
      amendmentSummaryListParams: mapAmendmentToAmendmentSummaryListParams(amendment, facility, true),
    };

    expect(result).toEqual(expected);
  });
});

describe(`createAmendmentDetailsViewModel for user role ${ROLES.CHECKER}`, () => {
  it(`should return the expected view model when portal amendment status is ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, () => {
    // Arrange
    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL).build();
    const userRoles = [ROLES.CHECKER];
    const canSubmitFacilityAmendmentToChecker = false;

    // Act
    const result = createAmendmentDetailsViewModel({ amendment, facility, deal, userRoles, banner });

    // Assert
    const expected = {
      userRoles,
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      submitAmendment: true,
      dealId: deal._id,
      facilityId: facility._id,
      amendmentId: amendment.amendmentId,
      effectiveDate: '',
      banner,
      canSubmitFacilityAmendmentToChecker,
      previousPage: `/gef/application-details/${deal._id}`,
      amendmentSummaryListParams: mapAmendmentToAmendmentSummaryListParams(amendment, facility, false),
    };

    expect(result).toEqual(expected);
  });
});
