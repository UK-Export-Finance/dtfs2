import { isCountryUk } from './is-country-uk';
import { GB_ISO3166_CODE } from '../constants/country';

const countries = [
  {
    country: 'england',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'England',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'ENGLAND',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'wales',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'scotland',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'northern ireland',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'great britain',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'united kingdom',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'united kingdom of great britain and northern ireland',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'uk',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'UK',
    expected: true,
    code: GB_ISO3166_CODE,
  },
  {
    country: 'Ireland',
    expected: false,
    code: '',
  },
  {
    country: 'ireland',
    expected: false,
    code: '',
  },
  {
    country: '',
    expected: false,
    code: '',
  },
  {
    country: ' ',
    expected: false,
    code: '',
  },
  {
    country: String(),
    expected: false,
    code: '',
  },
];

describe('isCountryUk', () => {
  it.each(countries)('should return $expected boolean value for country $country', ({ expected, country }) => {
    // Act
    const result = isCountryUk(country);

    // Assert
    expect(result).toBe(expected);
  });

  it.each(countries)('should return $expected string value for country $country', ({ code, country }) => {
    // Act
    const result = isCountryUk(country, true);

    // Assert
    expect(result).toBe(code);
  });
});
