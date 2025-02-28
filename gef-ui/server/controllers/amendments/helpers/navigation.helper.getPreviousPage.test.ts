import { PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getPreviousPage } from './navigation.helper';
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
  MANUAL_APPROVAL_NEEDED,
  CANCEL,
} = PORTAL_AMENDMENT_PAGES;

describe('getPreviousPage', () => {
  withPreviousPageTests({
    currentPage: WHAT_DO_YOU_NEED_TO_CHANGE,
    errorTestCases: [
      {
        description: '',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
    ],
  });

  withPreviousPageTests({
    currentPage: COVER_END_DATE,
    successTestCases: [
      {
        description: '',
        expectedPreviousPage: WHAT_DO_YOU_NEED_TO_CHANGE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).build(),
      },
      {
        description: '',
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).build(),
      },
    ],
    errorTestCases: [
      {
        description: 'when amendment is not changing cover end date',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(false).build(),
      },
    ],
  });

  withPreviousPageTests({
    currentPage: DO_YOU_HAVE_A_FACILITY_END_DATE,
    successTestCases: [
      {
        description: '',
        expectedPreviousPage: COVER_END_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).build(),
      },
    ],
    errorTestCases: [
      {
        description: 'when amendment is not changing cover end date',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(false).build(),
      },
    ],
  });

  withPreviousPageTests({
    currentPage: FACILITY_END_DATE,
    successTestCases: [
      {
        description: '',
        expectedPreviousPage: DO_YOU_HAVE_A_FACILITY_END_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).withIsUsingFacilityEndDate(true).build(),
      },
      {
        description: '',
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).withIsUsingFacilityEndDate(true).build(),
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

  withPreviousPageTests({
    currentPage: BANK_REVIEW_DATE,
    successTestCases: [
      {
        description: '',
        expectedPreviousPage: DO_YOU_HAVE_A_FACILITY_END_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeCoverEndDate(true).withIsUsingFacilityEndDate(false).build(),
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

  withPreviousPageTests({
    currentPage: FACILITY_VALUE,
    successTestCases: [
      {
        description: `when amendment is changing the cover end date and amendment is using facility end date`,
        expectedPreviousPage: FACILITY_END_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeFacilityValue(true)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .build(),
      },
      {
        description: `when amendment is changing the cover end date and amendment is using facility end date`,
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeFacilityValue(true)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .build(),
      },
      {
        description: `when amendment changing the cover end date & amendment is not using facility end date`,
        expectedPreviousPage: BANK_REVIEW_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeFacilityValue(true)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .build(),
      },
      {
        description: `when amendment changing the cover end date & amendment is not using facility end date`,
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeFacilityValue(true)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .build(),
      },
      {
        description: `when amendment is not changing the cover end date`,
        expectedPreviousPage: WHAT_DO_YOU_NEED_TO_CHANGE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(true).withChangeCoverEndDate(false).build(),
      },
      {
        description: `when amendment is not changing the cover end date`,
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(true).withChangeCoverEndDate(false).build(),
      },
    ],
    errorTestCases: [
      {
        description: 'when amendment is not changing facility value',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(false).build(),
      },
    ],
  });

  withPreviousPageTests({
    currentPage: ELIGIBILITY,
    successTestCases: [
      {
        description: `when amendment is changing facility value`,
        expectedPreviousPage: FACILITY_VALUE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(true).build(),
      },
      {
        description: `when amendment is changing facility value`,
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(true).build(),
      },
      {
        description: `when amendment is not changing facility value, is changing the cover end date and is using facility end date`,
        expectedPreviousPage: FACILITY_END_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeFacilityValue(false)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .build(),
      },
      {
        description: `when amendment is not changing facility value, is changing the cover end date and is using facility end date`,
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeFacilityValue(false)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .build(),
      },
      {
        description: `when amendment is not changing facility value, is changing the cover end date and is not using facility end date`,
        expectedPreviousPage: BANK_REVIEW_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeFacilityValue(false)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .build(),
      },
      {
        description: `when amendment is not changing facility value, is changing the cover end date and is not using facility end date`,
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withChangeFacilityValue(false)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .build(),
      },
      {
        description: `when amendment is not changing facility value or changing the cover end date`,
        expectedPreviousPage: WHAT_DO_YOU_NEED_TO_CHANGE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(false).withChangeCoverEndDate(false).build(),
      },
      {
        description: `when amendment is not changing facility value or changing the cover end date`,
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().withChangeFacilityValue(false).withChangeCoverEndDate(false).build(),
      },
    ],
  });

  withPreviousPageTests({
    currentPage: MANUAL_APPROVAL_NEEDED,
    successTestCases: [
      {
        description: 'when eligibility criteria have at least one "false" answer',
        expectedPreviousPage: ELIGIBILITY,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withCriteria([
            { id: 1, text: 'Criterion 1', answer: true },
            { id: 2, text: 'Criterion 2', answer: false },
            { id: 3, text: 'Criterion 3', answer: true },
          ])
          .build(),
      },
    ],
    errorTestCases: [
      {
        description: 'when eligibility criteria all have "true" answers',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withCriteria([
            { id: 1, text: 'Criterion 1', answer: true },
            { id: 2, text: 'Criterion 2', answer: true },
            { id: 3, text: 'Criterion 3', answer: true },
          ])
          .build(),
      },
    ],
  });

  withPreviousPageTests({
    currentPage: EFFECTIVE_DATE,
    successTestCases: [
      {
        description: '',
        expectedPreviousPage: ELIGIBILITY,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
      {
        description: '',
        expectedPreviousPage: CHECK_YOUR_ANSWERS,
        check: true,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
    ],
  });

  withPreviousPageTests({
    currentPage: CHECK_YOUR_ANSWERS,
    successTestCases: [
      {
        description: '',
        expectedPreviousPage: EFFECTIVE_DATE,
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
    ],
  });

  withPreviousPageTests({
    currentPage: CANCEL,
    errorTestCases: [
      {
        description: '',
        amendment: new PortalFacilityAmendmentWithUkefIdMockBuilder().build(),
      },
    ],
  });
});

function withPreviousPageTests({
  currentPage,
  successTestCases,
  errorTestCases,
}: {
  currentPage: PortalAmendmentPage;
  successTestCases?: {
    expectedPreviousPage: PortalAmendmentPage;
    check?: boolean;
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
      it.each(successTestCases)(`should return $expectedPreviousPage url $description`, ({ expectedPreviousPage, amendment, check }) => {
        // Act
        const result = getPreviousPage(currentPage, amendment, check);

        // Assert
        expect(result).toEqual(
          `/gef/application-details/${amendment.dealId}/facilities/${amendment.facilityId}/amendments/${amendment.amendmentId}/${expectedPreviousPage}`,
        );
      });
    }

    if (errorTestCases) {
      it.each(errorTestCases)(`should throw an error $description`, ({ amendment }) => {
        // Act + Assert
        expect(() => getPreviousPage(currentPage, amendment)).toThrow();
      });
    }
  });
}
