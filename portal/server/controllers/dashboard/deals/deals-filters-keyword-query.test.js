import CONSTANTS from '../../../constants';
import { generateKeywordQuery } from '../filters/generate-keyword-query';
import dealsKeywordQuery from './deals-filters-keyword-query';

describe('controllers/dashboard/deals - filters - keyword query', () => {
  const keywordValue = 'testing';

  it('should return result of generateKeywordQuery', () => {
    const expectedFields = [
      CONSTANTS.FIELD_NAMES.DEAL.BANK_INTERNAL_REF_NAME,
      CONSTANTS.FIELD_NAMES.DEAL.STATUS,
      CONSTANTS.FIELD_NAMES.DEAL.DEAL_TYPE,
      CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE,
      CONSTANTS.FIELD_NAMES.DEAL.EXPORTER_COMPANY_NAME,
    ];

    const result = dealsKeywordQuery(keywordValue);

    const expected = generateKeywordQuery(
      expectedFields,
      keywordValue,
    );

    expect(result).toEqual(expected);
  });
});
