const Chance = require('chance');

const chance = new Chance();

const EXPORTER = [
  {
    // Not started - the mock inserter will ignore this line as the updatedTime is bumped
    // but leave it in as its index based
  },
  {
    // Half Completed
    companiesHouseRegistrationNumber: null,
    companyName: chance.company(),
    registeredAddress: null,
    correspondenceAddress: null,
    selectedIndustry: {
      code: "1003",
      name: "Manufacturing",
      class: {
        code: "25300",
        name: "Manufacture of steam generators, except central heating hot water boilers",
      },
    },
    industries: [
      {
        code: "1003",
        name: "Manufacturing",
        class: {
          code: "25300",
          name: "Manufacture of steam generators, except central heating hot water boilers",
        },
      },
    ],
    smeType: "MEDIUM",
    probabilityOfDefault: 67,
    isFinanceIncreasing: false,
  },
  {
    // Completed
    companiesHouseRegistrationNumber: "08547313",
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
      code: "1003",
      name: "Manufacturing",
      class: {
        code: "25620",
        name: "Machining",
      },
    },
    industries: [
      {
        code: "1003",
        name: "Manufacturing",
        class: {
          code: "25300",
          name: "Manufacture of steam generators, except central heating hot water boilers",
        },
      },
      {
        code: "1003",
        name: "Manufacturing",
        class: {
          code: "25620",
          name: "Machining",
        },
      },
      {
        code: "1003",
        name: "Manufacturing",
        class: {
          code: "28110",
          name: "Manufacture of engines and turbines, except aircraft, vehicle and cycle engines",
        },
      },
    ],
    smeType: "MICRO",
    probabilityOfDefault: 14,
    isFinanceIncreasing: true,
  },
];

module.exports = EXPORTER;
