import CONSTANTS from '../../../constants';
import { generateKeywordQuery } from '../filters/generate-keyword-query';
import facilitiesKeywordQuery from './facilities-filters-keyword-query';

describe('controllers/dashboard/facilities - filters - keyword query', () => {
  const keywordValue = 'testing';

  it('should return result of generateKeywordQuery', () => {
    const expectedFields = [
      CONSTANTS.FIELD_NAMES.FACILITY.DEAL_SUBMISSION_TYPE,
      CONSTANTS.FIELD_NAMES.FACILITY.NAME,
      CONSTANTS.FIELD_NAMES.FACILITY.UKEF_FACILITY_ID,
      CONSTANTS.FIELD_NAMES.FACILITY.CURRENCY,
      CONSTANTS.FIELD_NAMES.FACILITY.VALUE,
      CONSTANTS.FIELD_NAMES.FACILITY.TYPE,
    ];

    const result = facilitiesKeywordQuery(keywordValue);

    const expected = generateKeywordQuery(
      expectedFields,
      keywordValue,
    );

    expect(result).toEqual(expected);
  });
});
