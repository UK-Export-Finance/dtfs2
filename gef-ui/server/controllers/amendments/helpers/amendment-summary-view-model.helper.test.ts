import { format, getUnixTime } from 'date-fns';
import { DATE_FORMATS } from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { mapAmendmentToAmendmentSummaryListParams } from './amendment-summary-view-model.helper';
import { getAmendmentsUrl } from './navigation.helper';

const amendmentId = 'amendmentId';
const facilityId = 'facilityId';
const dealId = 'dealId';

describe('mapAmendmentToAmendmentSummaryListParams', () => {
  describe('when changing cover end date only', () => {
    it('generates the correct amendment rows when using facility end date', () => {
      // Arrange
      const facilityEndDate = new Date();
      const coverEndDate = new Date();

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withChangeFacilityValue(false)
        .withCoverEndDate(coverEndDate.valueOf())
        .withFacilityEndDate(facilityEndDate)
        .build();

      // Act
      const result = mapAmendmentToAmendmentSummaryListParams(amendment);

      // Assert
      const expectedAmendmentRows = [
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE })}/#amendmentOptions`,
                text: 'Change',
                visuallyHiddenText: 'whether amendending cover end date or facility value',
              },
            ],
          },
          key: {
            text: 'Changes',
          },
          value: {
            html: expect.stringContaining(`<li>Cover end date and Facility end date</li>`) as string,
          },
        },
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.COVER_END_DATE })}/#coverEndDate-day`,
                text: 'Change',
                visuallyHiddenText: 'cover end date',
              },
            ],
          },
          key: {
            text: 'New cover end date',
          },
          value: {
            text: format(coverEndDate, DATE_FORMATS.D_MMMM_YYYY),
          },
        },
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE })}/#facilityEndDate-day`,
                text: 'Change',
                visuallyHiddenText: 'facility end date',
              },
            ],
          },
          key: {
            text: 'New facility end date',
          },
          value: {
            text: format(facilityEndDate, DATE_FORMATS.D_MMMM_YYYY),
          },
        },
      ];
      expect(result.amendmentRows).toEqual(expectedAmendmentRows);
    });

    it('generates the correct amendment rows when using bank review date', () => {
      // Arrange
      const bankReviewDate = new Date();
      const coverEndDate = new Date();

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withChangeFacilityValue(false)
        .withCoverEndDate(coverEndDate.valueOf())
        .withBankReviewDate(bankReviewDate)
        .build();

      // Act
      const result = mapAmendmentToAmendmentSummaryListParams(amendment);

      // Assert
      const expectedAmendmentRows = [
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE })}/#amendmentOptions`,
                text: 'Change',
                visuallyHiddenText: 'whether amendending cover end date or facility value',
              },
            ],
          },
          key: {
            text: 'Changes',
          },
          value: {
            html: expect.stringContaining(`<li>Cover end date and Facility end date</li>`) as string,
          },
        },
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.COVER_END_DATE })}/#coverEndDate-day`,
                text: 'Change',
                visuallyHiddenText: 'cover end date',
              },
            ],
          },
          key: {
            text: 'New cover end date',
          },
          value: {
            text: format(coverEndDate, DATE_FORMATS.D_MMMM_YYYY),
          },
        },
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE })}/#bankReviewDate-day`,
                text: 'Change',
                visuallyHiddenText: 'bank review date',
              },
            ],
          },
          key: {
            text: 'New bank review date',
          },
          value: {
            text: format(bankReviewDate, DATE_FORMATS.D_MMMM_YYYY),
          },
        },
      ];
      expect(result.amendmentRows).toEqual(expectedAmendmentRows);
    });
  });

  describe('when changing facility value only', () => {
    it('generates the correct amendment rows', () => {
      // Arrange
      const facilityValue = 100;
      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withChangeCoverEndDate(false)
        .withFacilityValue(facilityValue)
        .build();

      // Act
      const result = mapAmendmentToAmendmentSummaryListParams(amendment);

      // Assert
      const expectedAmendmentRows = [
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE })}/#amendmentOptions`,
                text: 'Change',
                visuallyHiddenText: 'whether amendending cover end date or facility value',
              },
            ],
          },
          key: {
            text: 'Changes',
          },
          value: {
            html: expect.stringContaining(`<li>Facility value</li>`) as string,
          },
        },
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/#facilityValue`,
                text: 'Change',
                visuallyHiddenText: 'facility value',
              },
            ],
          },
          key: {
            text: 'New facility value',
          },
          value: {
            text: facilityValue.toString(),
          },
        },
      ];
      expect(result.amendmentRows).toEqual(expectedAmendmentRows);
    });
  });

  describe('when changing facility value and cover end date', () => {
    it('generates the correct amendment rows', () => {
      // Arrange
      const facilityValue = 100;
      const facilityEndDate = new Date();
      const coverEndDate = new Date();

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withCoverEndDate(coverEndDate.valueOf())
        .withFacilityEndDate(facilityEndDate)
        .withFacilityValue(facilityValue)
        .build();

      // Act
      const result = mapAmendmentToAmendmentSummaryListParams(amendment);

      // Assert
      const expectedAmendmentRows = [
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE })}/#amendmentOptions`,
                text: 'Change',
                visuallyHiddenText: 'whether amendending cover end date or facility value',
              },
            ],
          },
          key: {
            text: 'Changes',
          },
          value: {
            html: expect.stringContaining(`<li>Facility value</li>`) as string,
          },
        },
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.COVER_END_DATE })}/#coverEndDate-day`,
                text: 'Change',
                visuallyHiddenText: 'cover end date',
              },
            ],
          },
          key: {
            text: 'New cover end date',
          },
          value: {
            text: format(coverEndDate, DATE_FORMATS.D_MMMM_YYYY),
          },
        },
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE })}/#facilityEndDate-day`,
                text: 'Change',
                visuallyHiddenText: 'facility end date',
              },
            ],
          },
          key: {
            text: 'New facility end date',
          },
          value: {
            text: format(facilityEndDate, DATE_FORMATS.D_MMMM_YYYY),
          },
        },
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/#facilityValue`,
                text: 'Change',
                visuallyHiddenText: 'facility value',
              },
            ],
          },
          key: {
            text: 'New facility value',
          },
          value: {
            text: facilityValue.toString(),
          },
        },
      ];
      expect(result.amendmentRows).toEqual(expectedAmendmentRows);
    });
  });

  it('returns the correct eligibility criteria rows', () => {
    // Arrange
    const criteria = [
      { id: 1, text: 'Criterion 1', answer: true },
      { id: 2, text: 'Criterion 2', answer: true },
    ];

    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withAmendmentId(amendmentId)
      .withFacilityId(facilityId)
      .withDealId(dealId)
      .withCriteria(criteria)
      .build();

    // Act
    const result = mapAmendmentToAmendmentSummaryListParams(amendment);

    // Assert
    const expectedCriteriaRows = [
      {
        actions: {
          items: [
            {
              href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.ELIGIBILITY })}/#${criteria[0].id}`,
              text: 'Change',
              visuallyHiddenText: `response to eligibility criteria ${criteria[0].id}`,
            },
          ],
        },
        key: {
          html: `${criteria[0].id}. ${criteria[0].text}`,
        },
        value: {
          text: 'True',
        },
      },
      {
        actions: {
          items: [
            {
              href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.ELIGIBILITY })}/#${criteria[1].id}`,
              text: 'Change',
              visuallyHiddenText: `response to eligibility criteria ${criteria[1].id}`,
            },
          ],
        },
        key: {
          html: `${criteria[1].id}. ${criteria[1].text}`,
        },
        value: {
          text: 'True',
        },
      },
    ];
    expect(result.eligibilityRows).toEqual(expectedCriteriaRows);
  });

  it('returns the correct effective date rows', () => {
    // Arrange
    const effectiveDate = new Date();

    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withAmendmentId(amendmentId)
      .withFacilityId(facilityId)
      .withDealId(dealId)
      .withEffectiveDate(getUnixTime(effectiveDate))
      .build();

    // Act
    const result = mapAmendmentToAmendmentSummaryListParams(amendment);

    // Assert
    const expectedEffectiveDateRows = [
      {
        actions: {
          items: [
            {
              href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE })}/#effectiveDate-day`,
              text: 'Change',
              visuallyHiddenText: `date amendment effective from`,
            },
          ],
        },
        key: {
          text: 'Date',
        },
        value: {
          text: format(effectiveDate, DATE_FORMATS.D_MMMM_YYYY),
        },
      },
    ];
    expect(result.effectiveDateRows).toEqual(expectedEffectiveDateRows);
  });
});
