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
      submissionDate: moment().utc().valueOf(),
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
      bankSupplyContractID: 'abc/2/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Automatic Inclusion Notice',
      status: 'Draft',
      submissionDate: moment().utc().valueOf(),
    },
    submissionDetails: {
      status: 'Not Started',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/3/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Automatic Inclusion Notice',
      status: 'Draft',
      submissionDate: moment().utc().valueOf(),
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/4/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Manual Inclusion Notice',
      status: "Ready for Checker's approval",
      previousStatus: 'Draft',
      submissionDate: moment().utc().valueOf(),
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
      bankSupplyContractID: 'abc/5/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Manual Inclusion Application',
      status: "Further Maker's input required",
      previousStatus: "Ready for Checker's approval",
      submissionDate: moment().utc().valueOf(),
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
      bankSupplyContractID: 'abc/6/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Abandoned Deal',
      previousStatus: 'Draft',
      submissionDate: moment().utc().valueOf(),
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/7/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Submitted',
      previousStatus: "Ready for Checker's approval",
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
      bankSupplyContractID: 'abc/8/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Submitted',
      previousStatus: "Ready for Checker's approval",
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
      bankSupplyContractID: 'abc/9/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: "Ready for Checker's approval",
      previousStatus: 'Draft',
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
      bankSupplyContractID: 'abc/10/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Acknowledged by UKEF',
      previousStatus: 'Submitted',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/11/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Draft',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/12/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Draft',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/13/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Draft',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/14/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Acknowledged by UKEF',
      previousStatus: 'Submitted',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/15/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Accepted by UKEF (without conditions)',
      previousStatus: 'Submitted',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/16/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Rejected by UKEF',
      previousStatus: 'Submitted',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/17/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Rejected by UKEF',
      previousStatus: 'Submitted',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/18/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: "HELLO Further Maker's input required",
      previousStatus: "Ready for Checker's approval",
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/19/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Accepted by UKEF (without conditions)',
      previousStatus: 'Submitted',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/20/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Accepted by UKEF (with conditions)',
      previousStatus: 'Submitted',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/21/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Abandoned Deal',
      previousStatus: 'Draft',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  },
];
