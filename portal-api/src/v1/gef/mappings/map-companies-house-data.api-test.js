const mapCompaniesHouseData = require('./map-companies-house-data');

describe('mapCompaniesHouseData', () => {
  it('should return mapped object', () => {
    const mockData = {
      company_number: '1234',
      company_name: 'mock company',
      registered_office_address: {
        organisation_name: 'mock organistaion',
        address_line_2: 'line 2',
        address_line_1: 'line 1',
        address_line_3: 'line 3',
        locality: 'Inverurie',
        postal_code: 'mock postcode',
        country: 'test country',
      },
    };

    const mockIndustries = [
      {
        code: 'test code',
        name: 'test name',
        class: {
          code: 'class code',
          name: 'class name',
        },
      },
    ];

    const result = mapCompaniesHouseData(mockData, mockIndustries);

    expect(result.companiesHouseRegistrationNumber).toEqual(expect.any(String));
    expect(result.companyName).toEqual(expect.any(String));
    expect(result.registeredAddress).toEqual({
      organisationName: expect.any(String),
      addressLine1: expect.any(String),
      addressLine2: expect.any(String),
      addressLine3: expect.any(String),
      locality: expect.any(String),
      postalCode: expect.any(String),
      country: expect.any(String),
    });
    expect(result.selectedIndustry.code).toEqual(expect.any(String));
    expect(result.selectedIndustry.name).toEqual(expect.any(String));
    expect(result.selectedIndustry.class).toEqual({
      code: expect.any(String),
      name: expect.any(String),
    });
    expect(result.industries[0].code).toEqual(expect.any(String));
    expect(result.industries[0].name).toEqual(expect.any(String));
    expect(result.industries[0].class).toEqual({
      code: expect.any(String),
      name: expect.any(String),
    });
  });

  it('should return mapped object with `United Kingdom` as default country when none is provided', () => {
    const mockData = {
      company_number: '1234',
      company_name: 'mock company',
      registered_office_address: {
        organisation_name: 'mock organistaion',
        address_line_2: 'line 2',
        address_line_1: 'line 1',
        address_line_3: 'line 3',
        locality: 'Inverurie',
        postal_code: 'mock postcode',
      },
    };

    const mockIndustries = [
      {
        code: 'test code',
        name: 'test name',
        class: {
          code: 'class code',
          name: 'class name',
        },
      },
    ];

    const result = mapCompaniesHouseData(mockData, mockIndustries);

    expect(result.companiesHouseRegistrationNumber).toEqual(expect.any(String));
    expect(result.companyName).toEqual(expect.any(String));
    expect(result.registeredAddress).toEqual({
      organisationName: expect.any(String),
      addressLine1: expect.any(String),
      addressLine2: expect.any(String),
      addressLine3: expect.any(String),
      locality: expect.any(String),
      postalCode: expect.any(String),
      country: 'United Kingdom',
    });
    expect(result.selectedIndustry.code).toEqual(expect.any(String));
    expect(result.selectedIndustry.name).toEqual(expect.any(String));
    expect(result.selectedIndustry.class).toEqual({
      code: expect.any(String),
      name: expect.any(String),
    });
    expect(result.industries[0].code).toEqual(expect.any(String));
    expect(result.industries[0].name).toEqual(expect.any(String));
    expect(result.industries[0].class).toEqual({
      code: expect.any(String),
      name: expect.any(String),
    });
  });
});
