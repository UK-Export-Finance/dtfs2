const faker = require('faker');

const EXPORTER = [
  {
    companiesHouseRegistrationNumber: 123456789,
    companyName: faker.company.companyName(),
    registeredAddress: {
      line1: faker.address.streetName(),
      line2: faker.address.streetAddress(),
      county: faker.address.county(),
      country: 'GB',
      postcode: 'AB1 1AB',
    },
    correspondenceAddress: null,
    selectedIndustry: {
      code: '1003',
      name: 'Manufacturing',
      class: {
        code: '25620',
        name: 'Machining',
      },
    },
    industries: [
      {
        code: '1003',
        name: 'Manufacturing',
        class: {
          code: '25300',
          name: 'Manufacture of steam generators, except central heating hot water boilers',
        },
      },
      {
        code: '1003',
        name: 'Manufacturing',
        class: {
          code: '25620',
          name: 'Machining',
        },
      },
      {
        code: '1003',
        name: 'Manufacturing',
        class: {
          code: '28110',
          name: 'Manufacture of engines and turbines, except aircraft, vehicle and cycle engines',
        },
      },
    ],
    smeType: 'MICRO',
    probabilityOfDefault: 45.5,
    isFinanceIncreasing: true,
  },
];

module.exports = EXPORTER;
