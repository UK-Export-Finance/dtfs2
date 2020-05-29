const moment = require('moment');

const date = moment().add(1, 'month');

module.exports.dealWithIssuedBondAndNoCoverStartDate = {
  details: {
    bankSupplyContractID: 'abc/1/def',
    bankSupplyContractName: 'Tibettan submarine acquisition scheme',
    submissionType: 'Automatic Inclusion Notice',
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
  bondTransactions: {
    items: [
      {
        _id: '1234567891',
        bondIssuer: 'issuer',
        bondType: 'bond type',
        bondStage: 'Issued',
        'coverEndDate-day': moment(date).format('DD'),
        'coverEndDate-month': moment(date).format('MM'),
        'coverEndDate-year': moment(date).format('YYYY'),
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
};
