import { format, getUnixTime } from 'date-fns';
import { CURRENCY, DATE_FORMATS, getFormattedMonetaryValue, now } from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { mapAmendmentToAmendmentSummaryListParams, generateFacilityValueSummaryRows, generateChangeLink } from './amendment-summary-view-model.helper';
import { getAmendmentsUrl } from './navigation.helper';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';

const amendmentId = 'amendmentId';
const facilityId = 'facilityId';
const dealId = 'dealId';

describe('amendment-summary-view-model.helper', () => {
  describe('generateChangeLink', () => {
    describe('when renderChangeLink is false', () => {
      it('should return an empty array', () => {
        const result = generateChangeLink({ href: '', visuallyHiddenText: '', datacy: '', renderChangeLink: false });

        expect(result).toEqual([]);
      });
    });

    describe('when renderChangeLink is true', () => {
      it('should return an array with a populated object', () => {
        const href = 'test-href';
        const visuallyHiddenText = 'test visually hidden text';
        const datacy = 'test-data-cy';

        const result = generateChangeLink({ href, visuallyHiddenText, datacy, renderChangeLink: true });

        const expected = [
          {
            href,
            text: 'Change',
            visuallyHiddenText,
            attributes: {
              'data-cy': datacy,
            },
          },
        ];

        expect(result).toEqual(expected);
      });
    });
  });

  describe('mapAmendmentToAmendmentSummaryListParams', () => {
    describe('when changing cover end date only', () => {
      it('should return the correct amendment rows when using facility end date', () => {
        // Arrange
        const facilityEndDate = new Date();
        const coverEndDate = new Date();

        const facility = MOCK_ISSUED_FACILITY.details;

        const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withAmendmentId(amendmentId)
          .withFacilityId(facilityId)
          .withDealId(dealId)
          .withChangeFacilityValue(false)
          .withCoverEndDate(coverEndDate.valueOf())
          .withFacilityEndDate(facilityEndDate)
          .build();

        // Act
        const result = mapAmendmentToAmendmentSummaryListParams(amendment, facility);

        // Assert
        const expectedAmendmentRows = [
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({
                    amendmentId,
                    facilityId,
                    dealId,
                    page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE,
                  })}/?change=true#amendmentOptions`,
                  text: 'Change',
                  visuallyHiddenText: 'whether amending cover end date or facility value',
                  attributes: {
                    'data-cy': 'change-amendment-options-link',
                  },
                },
              ],
            },
            key: {
              text: 'Changes',
              classes: 'amendment-options-key',
            },
            value: {
              html: expect.stringContaining(`<li>Cover end date and <br>Facility end date</li>`) as string,
            },
          },
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.COVER_END_DATE })}/?change=true#coverEndDate-day`,
                  text: 'Change',
                  visuallyHiddenText: 'cover end date',
                  attributes: {
                    'data-cy': 'change-cover-end-date-link',
                  },
                },
              ],
            },
            key: {
              text: 'New cover end date',
              classes: 'amendment-cover-end-date-key',
            },
            value: {
              text: format(coverEndDate, DATE_FORMATS.D_MMMM_YYYY),
              classes: 'amendment-cover-end-date-value',
            },
          },
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({
                    amendmentId,
                    facilityId,
                    dealId,
                    page: PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE,
                  })}/?change=true#facilityEndDate-day`,
                  text: 'Change',
                  visuallyHiddenText: 'facility end date',
                  attributes: {
                    'data-cy': 'change-facility-end-date-link',
                  },
                },
              ],
            },
            key: {
              text: 'New facility end date',
              classes: 'amendment-facility-end-date-key',
            },
            value: {
              text: format(facilityEndDate, DATE_FORMATS.D_MMMM_YYYY),
              classes: 'amendment-facility-end-date-value',
            },
          },
        ];
        expect(result.amendmentRows).toEqual(expectedAmendmentRows);
      });

      it('should return the correct amendment rows when using bank review date', () => {
        // Arrange
        const bankReviewDate = new Date();
        const coverEndDate = new Date();

        const facility = MOCK_ISSUED_FACILITY.details;

        const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withAmendmentId(amendmentId)
          .withFacilityId(facilityId)
          .withDealId(dealId)
          .withChangeFacilityValue(false)
          .withCoverEndDate(coverEndDate.valueOf())
          .withBankReviewDate(bankReviewDate)
          .build();

        // Act
        const result = mapAmendmentToAmendmentSummaryListParams(amendment, facility);

        // Assert
        const expectedAmendmentRows = [
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({
                    amendmentId,
                    facilityId,
                    dealId,
                    page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE,
                  })}/?change=true#amendmentOptions`,
                  text: 'Change',
                  visuallyHiddenText: 'whether amending cover end date or facility value',
                  attributes: {
                    'data-cy': 'change-amendment-options-link',
                  },
                },
              ],
            },
            key: {
              text: 'Changes',
              classes: 'amendment-options-key',
            },
            value: {
              html: expect.stringContaining(`<li>Cover end date and <br>Bank review date</li>`) as string,
            },
          },
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.COVER_END_DATE })}/?change=true#coverEndDate-day`,
                  text: 'Change',
                  visuallyHiddenText: 'cover end date',
                  attributes: {
                    'data-cy': 'change-cover-end-date-link',
                  },
                },
              ],
            },
            key: {
              text: 'New cover end date',
              classes: 'amendment-cover-end-date-key',
            },
            value: {
              text: format(coverEndDate, DATE_FORMATS.D_MMMM_YYYY),
              classes: 'amendment-cover-end-date-value',
            },
          },
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({
                    amendmentId,
                    facilityId,
                    dealId,
                    page: PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE,
                  })}/?change=true#bankReviewDate-day`,
                  text: 'Change',
                  visuallyHiddenText: 'bank review date',
                  attributes: {
                    'data-cy': 'change-bank-review-date-link',
                  },
                },
              ],
            },
            key: {
              text: 'New bank review date',
              classes: 'amendment-bank-review-date-key',
            },
            value: {
              text: format(bankReviewDate, DATE_FORMATS.D_MMMM_YYYY),
              classes: 'amendment-bank-review-date-value',
            },
          },
        ];
        expect(result.amendmentRows).toEqual(expectedAmendmentRows);
      });
    });

    describe('when changing facility value only', () => {
      it('should return the correct amendment rows', () => {
        // Arrange
        const facilityValue = 100000;
        const formattedFacilityValue = `${CURRENCY.GBP} ${getFormattedMonetaryValue(facilityValue)}`;

        const facility = MOCK_ISSUED_FACILITY.details;

        const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withAmendmentId(amendmentId)
          .withFacilityId(facilityId)
          .withDealId(dealId)
          .withChangeCoverEndDate(false)
          .withFacilityValue(facilityValue)
          .build();

        // Act
        const result = mapAmendmentToAmendmentSummaryListParams(amendment, facility);

        // Assert
        const expectedAmendmentRows = [
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({
                    amendmentId,
                    facilityId,
                    dealId,
                    page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE,
                  })}/?change=true#amendmentOptions`,
                  text: 'Change',
                  visuallyHiddenText: 'whether amending cover end date or facility value',
                  attributes: {
                    'data-cy': 'change-amendment-options-link',
                  },
                },
              ],
            },
            key: {
              text: 'Changes',
              classes: 'amendment-options-key',
            },
            value: {
              html: expect.stringContaining(`<li>Facility value</li>`) as string,
            },
          },
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/?change=true#facilityValue`,
                  text: 'Change',
                  visuallyHiddenText: 'facility value',
                  attributes: {
                    'data-cy': 'change-facility-value-link',
                  },
                },
              ],
            },
            key: {
              text: 'New facility value',
              classes: 'amendment-facility-value-key',
            },
            value: {
              text: formattedFacilityValue,
              classes: 'amendment-facility-value-value',
            },
          },
        ];
        expect(result.amendmentRows).toEqual(expectedAmendmentRows);
      });
    });

    describe('when changing facility value and cover end date', () => {
      it('should return the correct amendment rows', () => {
        // Arrange

        const facilityValue = 100;
        const facilityEndDate = new Date();
        const coverEndDate = new Date();
        const formattedFacilityValue = `${CURRENCY.GBP} ${getFormattedMonetaryValue(facilityValue)}`;

        const facility = MOCK_ISSUED_FACILITY.details;

        const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withAmendmentId(amendmentId)
          .withFacilityId(facilityId)
          .withDealId(dealId)
          .withCoverEndDate(coverEndDate.valueOf())
          .withFacilityEndDate(facilityEndDate)
          .withFacilityValue(facilityValue)
          .build();

        // Act
        const result = mapAmendmentToAmendmentSummaryListParams(amendment, facility);

        // Assert
        const expectedAmendmentRows = [
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({
                    amendmentId,
                    facilityId,
                    dealId,
                    page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE,
                  })}/?change=true#amendmentOptions`,
                  text: 'Change',
                  visuallyHiddenText: 'whether amending cover end date or facility value',
                  attributes: {
                    'data-cy': 'change-amendment-options-link',
                  },
                },
              ],
            },
            key: {
              text: 'Changes',
              classes: 'amendment-options-key',
            },
            value: {
              html: expect.stringMatching(/<li>Cover end date and <br>Facility end date<\/li>\w*\n\w*<li>Facility value<\/li>/) as string,
            },
          },
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.COVER_END_DATE })}/?change=true#coverEndDate-day`,
                  text: 'Change',
                  visuallyHiddenText: 'cover end date',
                  attributes: {
                    'data-cy': 'change-cover-end-date-link',
                  },
                },
              ],
            },
            key: {
              text: 'New cover end date',
              classes: 'amendment-cover-end-date-key',
            },
            value: {
              text: format(coverEndDate, DATE_FORMATS.D_MMMM_YYYY),
              classes: 'amendment-cover-end-date-value',
            },
          },
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({
                    amendmentId,
                    facilityId,
                    dealId,
                    page: PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE,
                  })}/?change=true#facilityEndDate-day`,
                  text: 'Change',
                  visuallyHiddenText: 'facility end date',
                  attributes: {
                    'data-cy': 'change-facility-end-date-link',
                  },
                },
              ],
            },
            key: {
              text: 'New facility end date',
              classes: 'amendment-facility-end-date-key',
            },
            value: {
              text: format(facilityEndDate, DATE_FORMATS.D_MMMM_YYYY),
              classes: 'amendment-facility-end-date-value',
            },
          },
          {
            actions: {
              items: [
                {
                  href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/?change=true#facilityValue`,
                  text: 'Change',
                  visuallyHiddenText: 'facility value',
                  attributes: {
                    'data-cy': 'change-facility-value-link',
                  },
                },
              ],
            },
            key: {
              text: 'New facility value',
              classes: 'amendment-facility-value-key',
            },
            value: {
              text: formattedFacilityValue,
              classes: 'amendment-facility-value-value',
            },
          },
        ];
        expect(result.amendmentRows).toEqual(expectedAmendmentRows);
      });
    });

    it('should return the correct eligibility criteria rows', () => {
      // Arrange
      const criteria = [
        { id: 1, text: 'Criterion 1', answer: true },
        { id: 2, text: 'Criterion 2', answer: true },
      ];

      const facility = MOCK_ISSUED_FACILITY.details;

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withCriteria(criteria)
        .build();

      // Act
      const result = mapAmendmentToAmendmentSummaryListParams(amendment, facility);

      // Assert
      const expectedCriteriaRows = [
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.ELIGIBILITY })}/?change=true#${criteria[0].id}`,
                text: 'Change',
                visuallyHiddenText: `response to eligibility criterion ${criteria[0].id}`,
                attributes: {
                  'data-cy': `change-eligibility-criterion-${criteria[0].id}-link`,
                },
              },
            ],
          },
          key: {
            html: `${criteria[0].id}. ${criteria[0].text}`,
            classes: `amendment-eligibility-${criteria[0].id}-key`,
          },
          value: {
            text: 'True',
            classes: `amendment-eligibility-${criteria[0].id}-value`,
          },
        },
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.ELIGIBILITY })}/?change=true#${criteria[1].id}`,
                text: 'Change',
                visuallyHiddenText: `response to eligibility criterion ${criteria[1].id}`,
                attributes: {
                  'data-cy': `change-eligibility-criterion-${criteria[1].id}-link`,
                },
              },
            ],
          },
          key: {
            html: `${criteria[1].id}. ${criteria[1].text}`,
            classes: `amendment-eligibility-${criteria[1].id}-key`,
          },
          value: {
            text: 'True',
            classes: `amendment-eligibility-${criteria[1].id}-value`,
          },
        },
      ];
      expect(result.eligibilityRows).toEqual(expectedCriteriaRows);
    });

    it('should return the correct effective date rows', () => {
      // Arrange
      const effectiveDate = new Date();

      const facility = MOCK_ISSUED_FACILITY.details;

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withEffectiveDate(getUnixTime(effectiveDate))
        .build();

      // Act
      const result = mapAmendmentToAmendmentSummaryListParams(amendment, facility);

      // Assert
      const expectedEffectiveDateRows = [
        {
          actions: {
            items: [
              {
                href: `${getAmendmentsUrl({ amendmentId, facilityId, dealId, page: PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE })}/?change=true#effectiveDate-day`,
                text: 'Change',
                visuallyHiddenText: `date amendment effective from`,
                attributes: {
                  'data-cy': 'change-effective-date-link',
                },
              },
            ],
          },
          key: {
            text: 'Date',
            classes: 'amendment-effective-date-key',
          },
          value: {
            text: format(effectiveDate, DATE_FORMATS.D_MMMM_YYYY),
            classes: 'amendment-effective-date-value',
          },
        },
      ];
      expect(result.effectiveDateRows).toEqual(expectedEffectiveDateRows);
    });
  });

  describe('generateFacilityValueSummaryRows', () => {
    it('should show new facility value as GBP 100', () => {
      // Arrange
      const facilityValue = 100;
      const facility = MOCK_ISSUED_FACILITY.details;

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withCoverEndDate(now().valueOf())
        .withFacilityValue(facilityValue)
        .build();

      // Act
      const result = generateFacilityValueSummaryRows(amendment, facility);

      // Assert
      const expected = [
        {
          key: {
            text: 'New facility value',
            classes: 'amendment-facility-value-key',
          },
          value: {
            text: `${CURRENCY.GBP} 100.00`,
            classes: 'amendment-facility-value-value',
          },
          actions: {
            items: generateChangeLink({
              href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/?change=true#facilityValue`,
              visuallyHiddenText: 'facility value',
              datacy: 'change-facility-value-link',
              renderChangeLink: true,
            }),
          },
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should show new facility value as GBP 1,000', () => {
      // Arrange
      const facilityValue = 1000;
      const facility = MOCK_ISSUED_FACILITY.details;

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withCoverEndDate(now().valueOf())
        .withFacilityValue(facilityValue)
        .build();

      // Act
      const result = generateFacilityValueSummaryRows(amendment, facility);

      // Assert
      const expected = [
        {
          key: {
            text: 'New facility value',
            classes: 'amendment-facility-value-key',
          },
          value: {
            text: `${CURRENCY.GBP} 1,000.00`,
            classes: 'amendment-facility-value-value',
          },
          actions: {
            items: generateChangeLink({
              href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/?change=true#facilityValue`,
              visuallyHiddenText: 'facility value',
              datacy: 'change-facility-value-link',
              renderChangeLink: true,
            }),
          },
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should show new facility value as USD 10,000', () => {
      // Arrange
      const facilityValue = 10000;
      const facility = {
        ...MOCK_ISSUED_FACILITY.details,
        currency: {
          id: CURRENCY.USD,
        },
      };

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withCoverEndDate(now().valueOf())
        .withFacilityValue(facilityValue)
        .build();

      // Act
      const result = generateFacilityValueSummaryRows(amendment, facility);

      // Assert
      const expected = [
        {
          key: {
            text: 'New facility value',
            classes: 'amendment-facility-value-key',
          },
          value: {
            text: `${CURRENCY.USD} 10,000.00`,
            classes: 'amendment-facility-value-value',
          },
          actions: {
            items: generateChangeLink({
              href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/?change=true#facilityValue`,
              visuallyHiddenText: 'facility value',
              datacy: 'change-facility-value-link',
              renderChangeLink: true,
            }),
          },
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should show new facility value as EUR 100,000', () => {
      // Arrange
      const facilityValue = 100000;
      const facility = {
        ...MOCK_ISSUED_FACILITY.details,
        currency: {
          id: CURRENCY.EUR,
        },
      };

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withCoverEndDate(now().valueOf())
        .withFacilityValue(facilityValue)
        .build();

      // Act
      const result = generateFacilityValueSummaryRows(amendment, facility);

      // Assert
      const expected = [
        {
          key: {
            text: 'New facility value',
            classes: 'amendment-facility-value-key',
          },
          value: {
            text: `${CURRENCY.EUR} 100,000.00`,
            classes: 'amendment-facility-value-value',
          },
          actions: {
            items: generateChangeLink({
              href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/?change=true#facilityValue`,
              visuallyHiddenText: 'facility value',
              datacy: 'change-facility-value-link',
              renderChangeLink: true,
            }),
          },
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should show new facility value as JPY 1,000,000', () => {
      // Arrange
      const facilityValue = 1000000;
      const facility = {
        ...MOCK_ISSUED_FACILITY.details,
        currency: {
          id: CURRENCY.JPY,
        },
      };

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withCoverEndDate(now().valueOf())
        .withFacilityValue(facilityValue)
        .build();

      // Act
      const result = generateFacilityValueSummaryRows(amendment, facility);

      // Assert
      const expected = [
        {
          key: {
            text: 'New facility value',
            classes: 'amendment-facility-value-key',
          },
          value: {
            text: `${CURRENCY.JPY} 1,000,000.00`,
            classes: 'amendment-facility-value-value',
          },
          actions: {
            items: generateChangeLink({
              href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/?change=true#facilityValue`,
              visuallyHiddenText: 'facility value',
              datacy: 'change-facility-value-link',
              renderChangeLink: true,
            }),
          },
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should show new facility value as GBP 1,000,000,000', () => {
      // Arrange
      const facilityValue = 1000000000;
      const facility = MOCK_ISSUED_FACILITY.details;

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withCoverEndDate(now().valueOf())
        .withFacilityValue(facilityValue)
        .build();

      // Act
      const result = generateFacilityValueSummaryRows(amendment, facility);

      // Assert
      const expected = [
        {
          key: {
            text: 'New facility value',
            classes: 'amendment-facility-value-key',
          },
          value: {
            text: `${CURRENCY.GBP} 1,000,000,000.00`,
            classes: 'amendment-facility-value-value',
          },
          actions: {
            items: generateChangeLink({
              href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/?change=true#facilityValue`,
              visuallyHiddenText: 'facility value',
              datacy: 'change-facility-value-link',
              renderChangeLink: true,
            }),
          },
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should show new facility value - when facility value is not being amended', () => {
      // Arrange
      const facility = MOCK_ISSUED_FACILITY.details;

      const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withAmendmentId(amendmentId)
        .withFacilityId(facilityId)
        .withDealId(dealId)
        .withCoverEndDate(now().valueOf())
        .withChangeFacilityValue(false)
        .build();

      // Act
      const result = generateFacilityValueSummaryRows(amendment, facility);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
