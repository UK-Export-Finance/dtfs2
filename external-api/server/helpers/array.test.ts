import { CountryInterface, CurrencyInterface, IndustrySectorInterface } from '@ukef/dtfs2-common';
import { sortArrayAlphabetically } from './array';

describe('sortArrayAlphabetically', () => {
  const countryA = {
    id: 1,
    name: 'A',
    code: 'A',
  };

  const countryB = {
    id: 2,
    name: 'B',
    code: 'B',
    disabled: true,
  };

  const countryC = {
    id: 3,
    name: 'C',
    code: 'C',
  };

  const countryD = {
    id: 4,
    name: 'D',
    code: 'D',
  };

  const countryG = {
    id: 7,
    name: 'G',
    code: 'G',
  };

  it('should return sorted array for countries', () => {
    // Arrange
    const countries: CountryInterface[] = [countryA, countryC, countryG, countryD, countryB];

    // Act
    const result = sortArrayAlphabetically(countries, 'name');

    // Assert
    expect(result).toEqual([countryA, countryB, countryC, countryD, countryG]);
  });

  it('should return sorted array for currencies', () => {
    const currencyA = {
      currencyId: 1,
      text: 'A',
      id: 'A',
    };

    const currencyB = {
      currencyId: 2,
      text: 'B',
      id: 'B',
      disabled: true,
    };

    const currencyC = {
      currencyId: 3,
      text: 'C',
      id: 'C',
    };

    const currencyD = {
      currencyId: 4,
      text: 'D',
      id: 'D',
    };

    const currencyG = {
      currencyId: 7,
      text: 'G',
      id: 'G',
    };

    // Arrange
    const currencies: CurrencyInterface[] = [currencyB, currencyD, currencyA, currencyC, currencyG, currencyD];

    // Act
    const result = sortArrayAlphabetically(currencies, 'id');

    // Assert
    expect(result).toEqual([currencyA, currencyB, currencyC, currencyD, currencyD, currencyG]);
  });

  it('should return sorted array for industries', () => {
    const industry1020 = {
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
    };

    const industry1019 = {
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
    };

    const industry1008 = {
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
    };
    // Arrange
    const industries: IndustrySectorInterface[] = [industry1020, industry1008, industry1019];

    // Act
    const result = sortArrayAlphabetically(industries, 'code');

    // Assert
    expect(result).toEqual([industry1008, industry1019, industry1020]);
  });
});
