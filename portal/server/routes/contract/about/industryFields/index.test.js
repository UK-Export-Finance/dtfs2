const industryFields = require('.');
const { getIndustrySectorById, getIndustryClassById } = require('../getIndustryById');

const mockIndustrySectorCode = 'abc';
const mockIndustryClass = 'mock class';

const mockIndustrySectors = [
  {
    code: mockIndustrySectorCode,
    classes: [
      {
        code: mockIndustryClass,
        name: 'Mock industry name',
      },
    ],
  },
];

describe('industryFields', () => {
  describe('when there is no `industry-sector` or `industry-classes` value', () => {
    it('should return `industry-sector` and `industry-classes` as empty object', () => {
      const mockSubmissionDetails = {
        'industry-sector': '',
        'industry-class': '',
      };

      const result = industryFields(mockSubmissionDetails);

      const expected = {
        'industry-sector': {},
        'industry-class': {},
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is an `industry-sector` value', () => {
    it('should return a mapped `industry-sector` object', () => {
      const mockSubmissionDetails = {
        'industry-sector': mockIndustrySectorCode,
      };

      const result = industryFields(mockSubmissionDetails, mockIndustrySectors);

      const mappedSector = getIndustrySectorById(mockIndustrySectors, mockIndustrySectorCode);

      const expected = {
        code: mockIndustrySectorCode,
        name: mappedSector.name,
      };

      expect(result['industry-sector']).toEqual(expected);
    });
  });

  describe('when an industry class is found', () => {
    it('should return a mapped `industry-sector` object', () => {
      const mockSubmissionDetails = {
        'industry-sector': mockIndustrySectorCode,
        'industry-class': mockIndustryClass,
      };

      const result = industryFields(mockSubmissionDetails, mockIndustrySectors);

      const mappedSector = getIndustrySectorById(mockIndustrySectors, mockIndustrySectorCode);

      const expected = {
        code: mockIndustryClass,
        name: getIndustryClassById(mappedSector.classes, mockIndustryClass).name,
      };

      expect(result['industry-class']).toEqual(expected);
    });
  });

  describe('when no industry sector or class is found', () => {
    it('should return empty objects', () => {
      const mockSubmissionDetails = {
        'industry-sector': 'invalid',
        'industry-class': 'invalid',
      };

      const result = industryFields(mockSubmissionDetails, mockIndustrySectors);

      const expected = {
        'industry-sector': {},
        'industry-class': {},
      };

      expect(result).toEqual(expected);
    });
  });
});
