const moment = require('moment');

// NOTE!!
// these objects are to be pushed straight into the deal-api,
// so the fields need to go into the correct places in the object..

module.exports = [
  {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Automatic Inclusion Notice',
      status: 'Draft',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      status: 'Incomplete',
      'supplier-name': 'Supplier name 1',
    },
    eligibility: {
      status: 'Incomplete',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-2-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Automatic Inclusion Notice',
      status: 'Draft',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      status: 'Not Started',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-3-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Automatic Inclusion Notice',
      status: 'Draft',
      submissionDate: moment().utc().valueOf(),
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-4-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Manual Inclusion Notice',
      status: "Ready for Checker's approval",
      previousStatus: 'Draft',
      submissionDate: moment().utc().valueOf(),
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      "user" : {
          "firstname" : "bob",
          "surname" : "builder",
      },
      "timestamp" : "2020 07 01 11:12:08:194 +0100",
      "text" : "to me"
    }],
  }, {
    details: {
      bankSupplyContractID: 'abc-5-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Manual Inclusion Application',
      status: "Further Maker's input required",
      previousStatus: "Ready for Checker's approval",
      submissionDate: moment().utc().valueOf(),
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      "user" : {
          "firstname" : "bob",
          "surname" : "builder",
      },
      "timestamp" : "2020 07 01 11:12:08:194 +0100",
      "text" : "to me"
    }],
  }, {
    details: {
      bankSupplyContractID: 'abc-6-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Abandoned Deal',
      previousStatus: 'Draft',
      submissionDate: moment().utc().valueOf(),
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-7-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Submitted',
      previousStatus: "Ready for Checker's approval",
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      "user" : {
          "firstname" : "bob",
          "surname" : "builder",
      },
      "timestamp" : "2020 07 01 11:12:08:194 +0100",
      "text" : "to me"
    }],
  }, {
    details: {
      bankSupplyContractID: 'abc-8-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Submitted',
      previousStatus: "Ready for Checker's approval",
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      "user" : {
          "firstname" : "bob",
          "surname" : "builder",
      },
      "timestamp" : "2020 07 01 11:12:08:194 +0100",
      "text" : "to me"
    }],
  }, {
    details: {
      bankSupplyContractID: 'abc-9-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: "Ready for Checker's approval",
      previousStatus: 'Draft',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      "user" : {
          "firstname" : "bob",
          "surname" : "builder",
      },
      "timestamp" : "2020 07 01 11:12:08:194 +0100",
      "text" : "to me"
    }],
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Acknowledged by UKEF',
      previousStatus: 'Submitted',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Draft',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Draft',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Draft',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Acknowledged by UKEF',
      previousStatus: 'Submitted',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Accepted by UKEF (without conditions)',
      previousStatus: 'Submitted',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Rejected by UKEF',
      previousStatus: 'Submitted',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Rejected by UKEF',
      previousStatus: 'Submitted',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: "Further Maker's input required",
      previousStatus: "Ready for Checker's approval",
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc-1-def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Accepted by UKEF (without conditions)',
      previousStatus: 'Submitted',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc 2 def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Accepted by UKEF (with conditions)',
      previousStatus: 'Submitted',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc 2 def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Abandoned Deal',
      previousStatus: 'Draft',
      owningBank: {
        id: '956',
        name: 'Barclays Bank',
        emails: [
          'maker4@ukexportfinance.gov.uk',
          'checker4@ukexportfinance.gov.uk',
        ],
      },
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  },
];
