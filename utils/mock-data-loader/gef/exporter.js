const Chance = require('chance');

const chance = new Chance();

const EXPORTER_HALF_COMPLETE = {
  companiesHouseRegistrationNumber: null,
  companyName: chance.company(),
  registeredAddress: null,
  correspondenceAddress: null,
  selectedIndustry: {
    code: '1003',
    name: 'Manufacturing',
    class: {
      code: '25300',
      name: 'Manufacture of steam generators, except central heating hot water boilers',
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
  ],
  smeType: 'MEDIUM',
  probabilityOfDefault: 10,
  isFinanceIncreasing: false,
};

const EXPORTER_COMPLETED = {
  companiesHouseRegistrationNumber: '08547313',
  companyName: chance.company(),
  registeredAddress: {
    line1: chance.street({ syllables: 8 }),
    line2: chance.address({ short_suffix: true }),
    county: chance.state({ full: true }),
    country: chance.country({ full: true }),
    postcode: chance.postcode(),
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
  probabilityOfDefault: 14,
  isFinanceIncreasing: true,
};

const EXPORTER_NO_INDUSTRIES = {
  ...EXPORTER_HALF_COMPLETE,
  industries: [],
};

module.exports = {
  EXPORTER_HALF_COMPLETE,
  EXPORTER_COMPLETED,
  EXPORTER_NO_INDUSTRIES,
};
