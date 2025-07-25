import { PORTAL_AMENDMENT_STATUS, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getNextPage } from './navigation.helper';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { PortalAmendmentPage } from '../../../types/portal-amendments';

const {
  WHAT_DO_YOU_NEED_TO_CHANGE,
  COVER_END_DATE,
  DO_YOU_HAVE_A_FACILITY_END_DATE,
  FACILITY_END_DATE,
  BANK_REVIEW_DATE,
  FACILITY_VALUE,
  ELIGIBILITY,
  EFFECTIVE_DATE,
  CHECK_YOUR_ANSWERS,
  AMENDMENT_DETAILS,
  MANUAL_APPROVAL_NEEDED,
  SUBMITTED_FOR_CHECKING,
  CANCEL,
} = PORTAL_AMENDMENT_PAGES;

describe('getNextPage', () => {
  withNextPageTests({
    currentPage: WHAT_DO_YOU_NEED_TO_CHANGE,
    successTestCases: [
      {
        description: 'when changing the cover end date',
        expectedNextPage: COVER_END_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).build(),
      },
      {
        description: 'when changing the cover end date and the change query is true',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).build(),
      },
      {
        description: `when changing the cover end date, portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} and the change query is true`,
        expectedNextPage: AMENDMENT_DETAILS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
          .withChangeCoverEndDate(true)
          .build(),
      },
      {
        description: 'when changing the facility value but not the cover end date',
        expectedNextPage: FACILITY_VALUE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(false).withChangeFacilityValue(true).build(),
      },
      {
        description: 'when changing the facility value but not the cover end date and the change query is true',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(false).withChangeFacilityValue(true).build(),
      },
      {
        description: `when changing the facility value, portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} and the change query is true`,
        expectedNextPage: AMENDMENT_DETAILS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
          .withChangeCoverEndDate(false)
          .withChangeFacilityValue(true)
          .build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: COVER_END_DATE,
    successTestCases: [
      {
        description: 'when changing the cover end date',
        expectedNextPage: DO_YOU_HAVE_A_FACILITY_END_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).build(),
      },
      {
        description: 'when changing the cover end date and change query is true',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).build(),
      },
      {
        description: `when changing the cover end date, portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} and the change query is true`,
        expectedNextPage: AMENDMENT_DETAILS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
          .withChangeCoverEndDate(true)
          .build(),
      },
    ],
    errorTestCases: [
      {
        description: 'when amendment is not changing cover end date',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(false).build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: DO_YOU_HAVE_A_FACILITY_END_DATE,
    successTestCases: [
      {
        description: 'when using facility end date',
        expectedNextPage: FACILITY_END_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).withIsUsingFacilityEndDate(true).build(),
      },
      {
        description: 'when not using facility end date',
        expectedNextPage: BANK_REVIEW_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).withIsUsingFacilityEndDate(false).build(),
      },
    ],
    errorTestCases: [
      {
        description: 'when amendment is not changing cover end date',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(false).build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: FACILITY_END_DATE,
    successTestCases: [
      {
        description: 'when changing the facility value',
        expectedNextPage: FACILITY_VALUE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .withChangeFacilityValue(true)
          .build(),
      },
      {
        description: 'when changing the facility value',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .withChangeFacilityValue(true)
          .build(),
      },
      {
        description: `when changing the facility value, portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} and the change query is true`,
        expectedNextPage: AMENDMENT_DETAILS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .withChangeFacilityValue(true)
          .build(),
      },
      {
        description: 'when not changing the facility value',
        expectedNextPage: ELIGIBILITY,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .withChangeFacilityValue(false)
          .build(),
      },
      {
        description: 'when not changing the facility value',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .withChangeFacilityValue(false)
          .build(),
      },
      {
        description: `when not changing the facility value, portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} and the change query is true`,
        expectedNextPage: AMENDMENT_DETAILS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .withChangeFacilityValue(false)
          .build(),
      },
    ],
    errorTestCases: [
      {
        description: 'when amendment is not changing cover end date',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(false).build(),
      },
      {
        description: 'when amendment is changing cover end date but not using facility end date',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).withIsUsingFacilityEndDate(false).build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: BANK_REVIEW_DATE,
    successTestCases: [
      {
        description: 'when changing the facility value',
        expectedNextPage: FACILITY_VALUE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .withChangeFacilityValue(true)
          .build(),
      },
      {
        description: 'when changing the facility value',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .withChangeFacilityValue(true)
          .build(),
      },
      {
        description: `when changing the facility value, portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} and the change query is true`,
        expectedNextPage: AMENDMENT_DETAILS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .withChangeFacilityValue(true)
          .build(),
      },
      {
        description: 'when not changing the facility value',
        expectedNextPage: ELIGIBILITY,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .withChangeFacilityValue(false)
          .build(),
      },
      {
        description: 'when not changing the facility value',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .withChangeFacilityValue(false)
          .build(),
      },
      {
        description: `when changing the facility value, portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} and the change query is true`,
        expectedNextPage: AMENDMENT_DETAILS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .withChangeFacilityValue(false)
          .build(),
      },
    ],
    errorTestCases: [
      {
        description: 'when amendment is not changing cover end date',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(false).build(),
      },
      {
        description: 'when amendment is changing cover end date but is using facility end date',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).withIsUsingFacilityEndDate(true).build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: FACILITY_VALUE,
    successTestCases: [
      {
        description: 'when changing the facility value',
        expectedNextPage: ELIGIBILITY,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(true).build(),
      },
      {
        description: 'when changing the facility value',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(true).build(),
      },
      {
        description: `when changing the facility value, portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} and the change query is true`,
        expectedNextPage: AMENDMENT_DETAILS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
          .withChangeFacilityValue(true)
          .build(),
      },
    ],
    errorTestCases: [
      {
        description: 'when amendment is not changing facility value',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(false).build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: ELIGIBILITY,
    successTestCases: [
      {
        description: 'when all eligibility criteria answers are "true"',
        expectedNextPage: EFFECTIVE_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withCriteria([
            { id: 1, text: 'Criterion 1', answer: true },
            { id: 2, text: 'Criterion 2', answer: true },
            { id: 3, text: 'Criterion 3', answer: true },
          ])
          .build(),
      },
      {
        description: 'when all eligibility criteria answers are "true"',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withCriteria([
            { id: 1, text: 'Criterion 1', answer: true },
            { id: 2, text: 'Criterion 2', answer: true },
            { id: 3, text: 'Criterion 3', answer: true },
          ])
          .build(),
      },
      {
        description: `when all eligibility criteria answers are "true", portal amendment status is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} and the change query is true`,
        expectedNextPage: AMENDMENT_DETAILS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
          .withCriteria([
            { id: 1, text: 'Criterion 1', answer: true },
            { id: 2, text: 'Criterion 2', answer: true },
            { id: 3, text: 'Criterion 3', answer: true },
          ])
          .build(),
      },
      {
        description: 'when all eligibility criteria answers are "false"',
        expectedNextPage: MANUAL_APPROVAL_NEEDED,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withCriteria([
            { id: 1, text: 'Criterion 1', answer: false },
            { id: 2, text: 'Criterion 2', answer: false },
            { id: 3, text: 'Criterion 3', answer: false },
          ])
          .build(),
      },
      {
        description: 'when some eligibility criteria answers are "false"',
        expectedNextPage: MANUAL_APPROVAL_NEEDED,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withCriteria([
            { id: 1, text: 'Criterion 1', answer: true },
            { id: 2, text: 'Criterion 2', answer: false },
            { id: 3, text: 'Criterion 3', answer: true },
          ])
          .build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: MANUAL_APPROVAL_NEEDED,
    errorTestCases: [
      {
        description: 'when all eligibility criteria answers are all valid',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
      {
        description: 'when any eligibility criteria answers are all "false"',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withCriteria([
            { id: 1, text: 'Criterion 1', answer: false },
            { id: 2, text: 'Criterion 2', answer: false },
            { id: 3, text: 'Criterion 3', answer: false },
          ])
          .build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: EFFECTIVE_DATE,
    successTestCases: [
      {
        description: '',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
      {
        description: '',
        expectedNextPage: CHECK_YOUR_ANSWERS,
        change: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: CHECK_YOUR_ANSWERS,
    successTestCases: [
      {
        description: `when the amendment has status ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`,
        expectedNextPage: SUBMITTED_FOR_CHECKING,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL).build(),
      },
    ],
    errorTestCases: [
      {
        description: `when the amendment has status ${PORTAL_AMENDMENT_STATUS.DRAFT}`,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withStatus(PORTAL_AMENDMENT_STATUS.DRAFT).build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: CANCEL,
    errorTestCases: [
      {
        description: '',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
    ],
  });

  withNextPageTests({
    currentPage: SUBMITTED_FOR_CHECKING,
    errorTestCases: [
      {
        description: '',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
    ],
  });
});

function withNextPageTests({
  currentPage,
  successTestCases,
  errorTestCases,
}: {
  currentPage: PortalAmendmentPage;
  successTestCases?: {
    expectedNextPage: PortalAmendmentPage;
    change?: boolean;
    amendment: PortalFacilityAmendmentWithUkefId;
    description: string;
  }[];
  errorTestCases?: {
    amendment: PortalFacilityAmendmentWithUkefId;
    description: string;
  }[];
}) {
  describe(`when current page is ${currentPage}`, () => {
    if (successTestCases) {
      it.each(successTestCases)(`should return $expectedNextPage url $description`, ({ expectedNextPage, amendment, change }) => {
        // Act
        const result = getNextPage(currentPage, amendment, change);

        // Assert
        expect(result).toEqual(
          `/gef/application-details/${amendment.dealId}/facilities/${amendment.facilityId}/amendments/${amendment.amendmentId}/${expectedNextPage}`,
        );
      });
    }

    if (errorTestCases) {
      it.each(errorTestCases)(`should throw an error $description`, ({ amendment }) => {
        // Act + Assert
        expect(() => getNextPage(currentPage, amendment)).toThrow();
      });
    }
  });
}
