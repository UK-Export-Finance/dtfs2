import { DEAL_STATUS } from '@ukef/dtfs2-common';
import { dealTypeFilters, statusFilters, dealsTemplateFilters, createdByYouFilter } from './template-filters';
import { FIELD_NAMES, PRODUCT } from '../../../constants';
import CONTENT_STRINGS from '../../../content-strings';
import { generateFiltersArray, submissionTypeFilters } from '../filters/generate-template-filters';

describe('controllers/dashboard/deals - template-filters', () => {
  describe('dealTypeFilters', () => {
    it('should return generateFiltersArray with all possible `product` field inputs', () => {
      const mockSubmittedFilters = {};

      const result = dealTypeFilters(mockSubmittedFilters);

      const expectedFieldName = FIELD_NAMES.DEAL.DEAL_TYPE;

      const expectedFieldInputs = [
        { text: PRODUCT.BSS_EWCS, value: PRODUCT.BSS_EWCS },
        { text: PRODUCT.GEF, value: PRODUCT.GEF },
      ];

      const expected = generateFiltersArray(expectedFieldName, expectedFieldInputs, mockSubmittedFilters);

      expect(result).toEqual(expected);
    });
  });

  describe('statusFilters', () => {
    it('should return generateFiltersArray with all possible `product` field inputs', () => {
      const mockSubmittedFilters = {};

      const result = statusFilters(mockSubmittedFilters);

      const expectedFieldName = FIELD_NAMES.DEAL.STATUS;

      const expectedFieldInputs = [
        {
          text: CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES,
          value: CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES,
        },
        {
          text: DEAL_STATUS.DRAFT,
          value: DEAL_STATUS.DRAFT,
        },
        {
          text: DEAL_STATUS.READY_FOR_APPROVAL,
          value: DEAL_STATUS.READY_FOR_APPROVAL,
        },
        {
          text: DEAL_STATUS.CHANGES_REQUIRED,
          value: DEAL_STATUS.CHANGES_REQUIRED,
        },
        {
          text: DEAL_STATUS.SUBMITTED_TO_UKEF,
          value: DEAL_STATUS.SUBMITTED_TO_UKEF,
        },
        {
          text: DEAL_STATUS.UKEF_ACKNOWLEDGED,
          value: DEAL_STATUS.UKEF_ACKNOWLEDGED,
        },
        {
          text: DEAL_STATUS.IN_PROGRESS_BY_UKEF,
          value: DEAL_STATUS.IN_PROGRESS_BY_UKEF,
        },
        {
          text: DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
          value: DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
        },
        {
          text: DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
          value: DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
        },
        {
          text: DEAL_STATUS.UKEF_REFUSED,
          value: DEAL_STATUS.UKEF_REFUSED,
        },
        {
          text: DEAL_STATUS.ABANDONED,
          value: DEAL_STATUS.ABANDONED,
        },
      ];

      const expected = generateFiltersArray(expectedFieldName, expectedFieldInputs, mockSubmittedFilters);

      expect(result).toEqual(expected);
    });
  });

  describe('dealsTemplateFilters', () => {
    it('should return an object of all filters', () => {
      const result = dealsTemplateFilters();

      const expected = {
        createdBy: createdByYouFilter({}),
        dealType: dealTypeFilters({}),
        submissionType: submissionTypeFilters(FIELD_NAMES.DEAL.SUBMISSION_TYPE, {}),
        status: statusFilters({}),
      };

      expect(result).toEqual(expected);
    });
  });
});
