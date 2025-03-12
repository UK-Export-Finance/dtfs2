import { CountryInterface, CurrencyInterface, IndustrySectorInterface } from '@ukef/dtfs2-common';
import { sortArrayAlphabetically } from './array';

describe('sortArrayAlphabetically', () => {
  it('should return sorted array for countries', () => {
    // Arrange
    const countries: CountryInterface[] = [
      {
        id: 1,
        name: 'A',
        code: 'A',
      },
      {
        id: 7,
        name: 'G',
        code: 'G',
      },
      {
        id: 3,
        name: 'C',
        code: 'C',
      },
      {
        id: 4,
        name: 'D',
        code: 'D',
      },
      {
        id: 2,
        name: 'B',
        code: 'B',
        disabled: true,
      },
    ];

    // Act
    const result = sortArrayAlphabetically(countries, 'name');

    // Assert
    expect(result).toEqual([
      {
        id: 1,
        name: 'A',
        code: 'A',
      },
      {
        id: 2,
        name: 'B',
        code: 'B',
        disabled: true,
      },
      {
        id: 3,
        name: 'C',
        code: 'C',
      },
      {
        id: 4,
        name: 'D',
        code: 'D',
      },
      {
        id: 7,
        name: 'G',
        code: 'G',
      },
    ]);
  });

  it('should return sorted array for currencies', () => {
    // Arrange
    const currencies: CurrencyInterface[] = [
      {
        currencyId: 1,
        text: 'A',
        id: 'A',
      },
      {
        currencyId: 7,
        text: 'G',
        id: 'G',
      },
      {
        currencyId: 3,
        text: 'C',
        id: 'C',
      },
      {
        currencyId: 4,
        text: 'D',
        id: 'D',
      },
      {
        currencyId: 2,
        text: 'B',
        id: 'B',
        disabled: true,
      },
    ];

    // Act
    const result = sortArrayAlphabetically(currencies, 'id');

    // Assert
    expect(result).toEqual([
      {
        currencyId: 1,
        text: 'A',
        id: 'A',
      },
      {
        currencyId: 2,
        text: 'B',
        id: 'B',
        disabled: true,
      },
      {
        currencyId: 3,
        text: 'C',
        id: 'C',
      },
      {
        currencyId: 4,
        text: 'D',
        id: 'D',
      },
      {
        currencyId: 7,
        text: 'G',
        id: 'G',
      },
    ]);
  });

  it('should return sorted array for industries', () => {
    // Arrange
    const industries: IndustrySectorInterface[] = [
      {
        code: '1020',
        name: 'Activities of extraterritorial organisations and bodies',
        classes: [
          {
            code: '99000',
            name: 'Activities of extraterritorial organizations and bodies',
          },
          {
            code: '99999',
            name: 'Dormant Company',
          },
        ],
      },
      {
        code: '1019',
        name: 'Activities of households as employers; undifferentiated goods- and services-producing activities of households for own use',
        classes: [
          {
            code: '97000',
            name: ' Activities of households as employers of domestic personnel',
          },
          {
            code: '98000',
            name: ' Residents property management',
          },
          {
            code: '98100',
            name: ' Undifferentiated goods-producing activities of private households for own use',
          },
          {
            code: '98200',
            name: ' Undifferentiated service-producing activities of private households for own use',
          },
        ],
      },
      {
        code: '1008',
        name: 'Accommodation and food service activities',
        classes: [
          {
            code: '55100',
            name: 'Hotels and similar accommodation',
          },
          {
            code: '55201',
            name: 'Holiday centres and villages',
          },
          {
            code: '55202',
            name: 'Youth hostels',
          },
          {
            code: '55209',
            name: 'Other holiday and other collective accommodation',
          },
          {
            code: '55300',
            name: 'Recreational vehicle parks, trailer parks and camping grounds',
          },
          {
            code: '55900',
            name: 'Other accommodation',
          },
          {
            code: '56101',
            name: 'Licensed restaurants',
          },
          {
            code: '56102',
            name: 'Unlicensed restaurants and cafes',
          },
          {
            code: '56103',
            name: 'Take - away food shops and mobile food stands',
          },
          {
            code: '56210',
            name: 'Event catering activities',
          },
          {
            code: '56290',
            name: 'Other food services',
          },
          {
            code: '56301',
            name: 'Licensed clubs',
          },
          {
            code: '56302',
            name: 'Public houses and bars',
          },
        ],
      },
    ];

    // Act
    const result = sortArrayAlphabetically(industries, 'code');

    // Assert
    expect(result).toEqual([
      {
        code: '1008',
        name: 'Accommodation and food service activities',
        classes: [
          {
            code: '55100',
            name: 'Hotels and similar accommodation',
          },
          {
            code: '55201',
            name: 'Holiday centres and villages',
          },
          {
            code: '55202',
            name: 'Youth hostels',
          },
          {
            code: '55209',
            name: 'Other holiday and other collective accommodation',
          },
          {
            code: '55300',
            name: 'Recreational vehicle parks, trailer parks and camping grounds',
          },
          {
            code: '55900',
            name: 'Other accommodation',
          },
          {
            code: '56101',
            name: 'Licensed restaurants',
          },
          {
            code: '56102',
            name: 'Unlicensed restaurants and cafes',
          },
          {
            code: '56103',
            name: 'Take - away food shops and mobile food stands',
          },
          {
            code: '56210',
            name: 'Event catering activities',
          },
          {
            code: '56290',
            name: 'Other food services',
          },
          {
            code: '56301',
            name: 'Licensed clubs',
          },
          {
            code: '56302',
            name: 'Public houses and bars',
          },
        ],
      },
      {
        code: '1019',
        name: 'Activities of households as employers; undifferentiated goods- and services-producing activities of households for own use',
        classes: [
          {
            code: '97000',
            name: ' Activities of households as employers of domestic personnel',
          },
          {
            code: '98000',
            name: ' Residents property management',
          },
          {
            code: '98100',
            name: ' Undifferentiated goods-producing activities of private households for own use',
          },
          {
            code: '98200',
            name: ' Undifferentiated service-producing activities of private households for own use',
          },
        ],
      },
      {
        code: '1020',
        name: 'Activities of extraterritorial organisations and bodies',
        classes: [
          {
            code: '99000',
            name: 'Activities of extraterritorial organizations and bodies',
          },
          {
            code: '99999',
            name: 'Dormant Company',
          },
        ],
      },
    ]);
  });
});
