const faker = require('faker');

const EXPORTER = [{
// Not started - the mock inserter will ignore this line as the updatedTime is bumped
// but leave it in as its index based
},
{ // Half Completed
  companiesHouseRegistrationNumber: null,
  companyName: faker.company.companyName(),
  registeredAddress: null,
  correspondenceAddress: null,
  industrySector: null,
  industryClass: null,
  smeType: 'MEDIUM',
  probabilityOfDefault: 67,
  isFinanceIncreasing: false,
}, { // Completed
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
  industrySector: [{ code: '55100', name: 'Hotels and similar accommodation' }],
  industryClass: [{ code: '1008', name: 'Accommodation and food service activities' }],
  smeType: 'TINY',
  probabilityOfDefault: 45.5,
  isFinanceIncreasing: true,
}];

module.exports = EXPORTER;
