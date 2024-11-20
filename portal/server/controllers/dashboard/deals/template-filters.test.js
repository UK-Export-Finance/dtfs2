import { dealTypeFilters, statusFilters, dealsTemplateFilters, createdByYouFilter } from './template-filters';
import { FIELD_NAMES, PRODUCT, STATUS } from '../../../constants';
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
          text: STATUS.DEAL.DRAFT,
          value: STATUS.DEAL.DRAFT,
        },
        {
          text: STATUS.DEAL.READY_FOR_APPROVAL,
          value: STATUS.DEAL.READY_FOR_APPROVAL,
        },
        {
          text: STATUS.DEAL.CHANGES_REQUIRED,
          value: STATUS.DEAL.CHANGES_REQUIRED,
        },
        {
          text: STATUS.DEAL.SUBMITTED_TO_UKEF,
          value: STATUS.DEAL.SUBMITTED_TO_UKEF,
        },
        {
          text: STATUS.DEAL.UKEF_ACKNOWLEDGED,
          value: STATUS.DEAL.UKEF_ACKNOWLEDGED,
        },
        {
          text: STATUS.DEAL.IN_PROGRESS_BY_UKEF,
          value: STATUS.DEAL.IN_PROGRESS_BY_UKEF,
        },
        {
          text: STATUS.DEAL.UKEF_APPROVED_WITH_CONDITIONS,
          value: STATUS.DEAL.UKEF_APPROVED_WITH_CONDITIONS,
        },
        {
          text: STATUS.DEAL.UKEF_APPROVED_WITHOUT_CONDITIONS,
          value: STATUS.DEAL.UKEF_APPROVED_WITHOUT_CONDITIONS,
        },
        {
          text: STATUS.DEAL.UKEF_REFUSED,
          value: STATUS.DEAL.UKEF_REFUSED,
        },
        {
          text: STATUS.DEAL.CANCELLED,
          value: STATUS.DEAL.CANCELLED,
        },
        {
          text: STATUS.DEAL.ABANDONED,
          value: STATUS.DEAL.ABANDONED,
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
