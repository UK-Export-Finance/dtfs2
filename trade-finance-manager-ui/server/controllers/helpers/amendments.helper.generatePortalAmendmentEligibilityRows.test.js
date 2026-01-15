import { TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS, STATUS_TAG_COLOURS, isPortalFacilityAmendmentsFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { generatePortalAmendmentEligibilityRows } from './amendments.helper';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });

const { criteria } = anAcknowledgedPortalAmendment.eligibilityCriteria;

describe('generatePortalAmendmentEligibilityRows', () => {
  const expectedEligibility = [
    [
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[0].id}-id">${criteria[0].id}</span>`,
      },
      {
        html: `<span class="govuk-tag govuk-tag--green" data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${
          criteria[0].id
        }-tag"><strong>${String(criteria[0].answer).toUpperCase()}</strong></span>`,
      },
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[0].id}-text">${criteria[0].text}</span>`,
      },
    ],
    [
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[1].id}-id">${criteria[1].id}</span>`,
      },
      {
        html: `<span class="govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}" data-cy="amendment-${
          anAcknowledgedPortalAmendment.amendmentId
        }-eligibility-table-criterion-${criteria[1].id}-tag"><strong>${String(criteria[1].answer).toUpperCase()}</strong></span>`,
      },
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[1].id}-text">${criteria[1].text}</span>`,
      },
    ],
    [
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[2].id}-id">${criteria[2].id}</span>`,
      },
      {
        html: `<span class="govuk-tag govuk-tag--${STATUS_TAG_COLOURS.RED}" data-cy="amendment-${
          anAcknowledgedPortalAmendment.amendmentId
        }-eligibility-table-criterion-${criteria[2].id}-tag"><strong>${String(criteria[2].answer).toUpperCase()}</strong></span>`,
      },
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[2].id}-text">${criteria[2].text}</span>`,
      },
    ],
    [
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[3].id}-id">${criteria[3].id}</span>`,
      },
      {
        html: `<span class="govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}" data-cy="amendment-${
          anAcknowledgedPortalAmendment.amendmentId
        }-eligibility-table-criterion-${criteria[3].id}-tag"><strong>${String(criteria[3].answer).toUpperCase()}</strong></span>`,
      },
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[3].id}-text">${criteria[3].text}</span>`,
      },
    ],
    [
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[4].id}-id">${criteria[4].id}</span>`,
      },
      {
        html: `<span class="govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}" data-cy="amendment-${
          anAcknowledgedPortalAmendment.amendmentId
        }-eligibility-table-criterion-${criteria[4].id}-tag"><strong>${String(criteria[4].answer).toUpperCase()}</strong></span>`,
      },
      {
        html: `<span data-cy="amendment-${anAcknowledgedPortalAmendment.amendmentId}-eligibility-table-criterion-${criteria[4].id}-text">${criteria[4].text}</span>`,
      },
    ],
  ];
  describe('when the amendment is a portal amendment', () => {
    it('should generate eligibility rows with the correct criteria', () => {
      const result = generatePortalAmendmentEligibilityRows([anAcknowledgedPortalAmendment]);

      const expected = {
        ...anAcknowledgedPortalAmendment,
        isPortalAmendment: true,
        eligibilityRows: expectedEligibility,
      };

      expect(result).toEqual([expected]);
    });

    describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
      beforeEach(() => {
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);
      });

      it('should sort portal amendments by referenceNumber in descending order when all have referenceNumber', () => {
        const amendmentWithRef1 = {
          ...anAcknowledgedPortalAmendment,
          referenceNumber: '0041739690-001',
          eligibilityRows: expectedEligibility,
        };

        const amendmentWithRef2 = {
          ...anAcknowledgedPortalAmendment,
          referenceNumber: '0041739690-003',
          eligibilityRows: expectedEligibility,
        };

        const amendmentWithRef3 = {
          ...anAcknowledgedPortalAmendment,
          referenceNumber: '0041739690-002',
          eligibilityRows: expectedEligibility,
        };

        const result = generatePortalAmendmentEligibilityRows([amendmentWithRef1, amendmentWithRef2, amendmentWithRef3]);

        expect(result.map((a) => a.referenceNumber)).toEqual(['0041739690-003', '0041739690-002', '0041739690-001']);
      });

      it('should sort portal amendments putting those with referenceNumber first, then by version when referenceNumber is missing', () => {
        const amendmentWithRef = {
          ...anAcknowledgedPortalAmendment,
          referenceNumber: '0041739690-001',
          eligibilityRows: expectedEligibility,
        };

        const completedTFMAmendmentVersion1 = () => ({
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          submittedByPim: true,
          version: 1,
        });

        const completedTFMAmendmentVersion2 = () => ({
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          submittedByPim: true,
          version: 2,
        });

        const result = generatePortalAmendmentEligibilityRows([amendmentWithRef, completedTFMAmendmentVersion1(), completedTFMAmendmentVersion2()]);

        expect(result[0].referenceNumber).toEqual('0041739690-001');
        expect(result.slice(1).map((a) => a.version)).toEqual([2, 1]);
      });
    });
  });

  describe('when the amendment is a tfm amendment', () => {
    const completedTFMAmendment = () => ({
      status: TFM_AMENDMENT_STATUS.COMPLETED,
      submittedByPim: true,
    });

    const completedTFMAmendment2 = () => ({
      status: TFM_AMENDMENT_STATUS.COMPLETED,
      submittedByPim: true,
    });

    it('should return the amendment and flag set to false', () => {
      const result = generatePortalAmendmentEligibilityRows([completedTFMAmendment()]);

      const expected = {
        ...completedTFMAmendment(),
        isPortalAmendment: false,
      };

      expect(result).toEqual([expected]);
    });

    describe('when multiple amendments are passed in', () => {
      const expected1 = {
        ...completedTFMAmendment(),
        isPortalAmendment: false,
      };

      const expected2 = {
        ...completedTFMAmendment2(),
        isPortalAmendment: false,
      };

      describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is disabled', () => {
        beforeEach(() => {
          jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(false);
        });

        it('should return the array unreversed', () => {
          const result = generatePortalAmendmentEligibilityRows([completedTFMAmendment(), completedTFMAmendment2()]);

          expect(result).toEqual([expected1, expected2]);
        });
      });

      describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
        beforeEach(() => {
          jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);
        });

        it('should return the array reversed', () => {
          const result = generatePortalAmendmentEligibilityRows([completedTFMAmendment(), completedTFMAmendment2()]);

          expect(result).toEqual([expected2, expected1]);
        });
      });
    });
  });
});
