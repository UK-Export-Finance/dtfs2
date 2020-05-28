// NOTE!!
// these objects are to be pushed straight into the deal-api,
// so the fields need to go into the correct places in the object..
module.exports = [
  {
    details: {
      bankSupplyContractID: 'abc/1/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Automatic Inclusion Notice',
      status: 'Draft',
    },
    submissionDetails: {
      status: 'Incomplete',
      'supplier-name': 'Supplier name 1',
    },
    eligibility: {
      status: 'Completed',
      criteria: [
        { id: 11, answer: true },
        { id: 12, answer: true },
        { id: 13, answer: true },
        { id: 14, answer: true },
        { id: 15, answer: true },
        { id: 16, answer: true },
        { id: 17, answer: true },
        { id: 18, answer: true },
      ],
    },
    bondTransactions: {
      items: [
        {
          _id: '1234567891',
          bondIssuer: 'issuer',
          bondType: 'bond type',
          bondStage: 'unissued',
          ukefGuaranteeInMonths: '24',
          uniqueIdentificationNumber: '1234',
          bondBeneficiary: 'test',
          bondValue: '123',
          transactionCurrencySameAsSupplyContractCurrency: 'true',
          riskMarginFee: '1',
          coveredPercentage: '2',
          feeType: 'test',
          feeFrequency: 'test',
          dayCountBasis: 'test',
        },
      ],
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/2/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Automatic Inclusion Notice',
      status: 'Draft',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 1',
    },
    eligibility: {
      status: 'Incomplete',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/3/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Automatic Inclusion Notice',
      status: 'Draft',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    eligibility: {
      status: 'Completed',
      criteria: [
        { id: 11, answer: true },
        { id: 12, answer: true },
        { id: 13, answer: true },
        { id: 14, answer: true },
        { id: 15, answer: true },
        { id: 16, answer: true },
        { id: 17, answer: true },
        { id: 18, answer: true },
      ],
    },
    bondTransactions: {
      items: [
        { _id: '1234567' },
        { _id: '1234568' },
        { _id: '1234569' },
      ],
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/4/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Manual Inclusion Notice',
      status: "Ready for Checker's approval",
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    eligibility: {
      status: 'Completed',
      criteria: [
        { id: 11, answer: true },
        { id: 12, answer: true },
        { id: 13, answer: true },
        { id: 14, answer: true },
        { id: 15, answer: true },
        { id: 16, answer: true },
        { id: 17, answer: true },
        { id: 18, answer: true },
      ],
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/5/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      submissionType: 'Manual Inclusion Application',
      status: "Further Maker's input required",
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/6/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Abandoned Deal',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/7/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Submitted',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    eligibility: {
      status: 'Completed',
      criteria: [
        { id: 11, answer: true },
        { id: 12, answer: true },
        { id: 13, answer: true },
        { id: 14, answer: true },
        { id: 15, answer: true },
        { id: 16, answer: true },
        { id: 17, answer: true },
        { id: 18, answer: true },
      ],
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/8/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Submitted',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    eligibility: {
      status: 'Completed',
      criteria: [
        { id: 11, answer: true },
        { id: 12, answer: true },
        { id: 13, answer: true },
        { id: 14, answer: true },
        { id: 15, answer: true },
        { id: 16, answer: true },
        { id: 17, answer: true },
        { id: 18, answer: true },
      ],
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/9/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: "Ready for Checker's approval",
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/10/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Acknowledged by UKEF',
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
    eligibility: {
      status: 'Completed',
      criteria: [
        { id: 11, answer: true },
        { id: 12, answer: true },
        { id: 13, answer: true },
        { id: 14, answer: true },
        { id: 15, answer: true },
        { id: 16, answer: true },
        { id: 17, answer: true },
        { id: 18, answer: true },
      ],
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
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/15/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Accepted by UKEF (without conditions)',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/16/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Rejected by UKEF',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/17/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Rejected by UKEF',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/18/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: "Further Maker's input required",
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/19/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Accepted by UKEF (without conditions)',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/20/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Accepted by UKEF (with conditions)',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    details: {
      bankSupplyContractID: 'abc/21/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme',
      status: 'Abandoned Deal',
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  },
];
