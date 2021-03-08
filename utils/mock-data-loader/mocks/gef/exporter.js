const faker = require('faker');

const EXPORTER = [{ // Not started
  companiesHouseRegistrationNumber: null,
  companyName: null,
  registeredAddress: null,
  correspondenceAddress: null,
  industrySectorId: null,
  industryClassId: null,
  smeTypeId: null,
  probabilityOfDefault: null,
  isFinanceIncreasing: null,
},
{ // Half Completed
  companiesHouseRegistrationNumber: null,
  companyName: faker.company.companyName(),
  registeredAddress: null,
  correspondenceAddress: null,
  industrySectorId: 123,
  industryClassId: 123,
  smeTypeId: null,
  probabilityOfDefault: 67,
  isFinanceIncreasing: false,
}, { // Completed
  companiesHouseRegistrationNumber: null,
  companyName: faker.company.companyName(),
  registeredAddress: {
    line1: faker.address.streetName(),
    line2: faker.address.streetAddress(),
    county: faker.address.county(),
    country: 'GB',
    postcode: 'AB1 1AB',
  },
  correspondenceAddress: null,
  industrySectorId: 123,
  industryClassId: 123,
  smeTypeId: 2,
  probabilityOfDefault: 45,
  isFinanceIncreasing: true,
}];

module.exports = EXPORTER;
