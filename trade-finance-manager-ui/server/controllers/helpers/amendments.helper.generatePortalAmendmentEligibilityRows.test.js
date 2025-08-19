import { TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS, STATUS_TAG_COLOURS } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { generatePortalAmendmentEligibilityRows } from './amendments.helper';

const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });

const { criteria } = anAcknowledgedPortalAmendment.eligibilityCriteria;

describe('generatePortalAmendmentEligibilityRows', () => {
  describe('when the amendment is a portal amendment', () => {
    it('should generate eligibility rows with the correct criteria', () => {
      const result = generatePortalAmendmentEligibilityRows([anAcknowledgedPortalAmendment]);

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
      ];

      const expected = {
        ...anAcknowledgedPortalAmendment,
        isPortalAmendment: true,
        eligibilityRows: expectedEligibility,
      };

      expect(result).toEqual([expected]);
    });
  });

  describe('when the amendment is a tfm amendment', () => {
    const completedTFMAmendment = () => ({
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
  });
});
