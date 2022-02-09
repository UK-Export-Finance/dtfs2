const MOCK_CASH_CONTINGENT_FACILITIES = require('./mock-cash-contingent-facilities');
const MOCK_USERS = require('./mock-users');
const CONSTANTS = require('../../constants');

const MOCK_GEF_DEAL = {
  _id: 'MOCK_GEF_DEAL',
  dealType: 'GEF',
  dealId: 'MOCK_GEF_DEAL',
  additionalRefName: 'Additional Reference 001',
  bankInternalRefName: 'Internal Reference 001',
  submissionDate: '1626169888809',
  submissionCount: 1,
  submissionType: 'Automatic Inclusion Notice',
  createdAt: 1625827333471,
  exporter: {
    isFinanceIncreasing: true,
    companiesHouseRegistrationNumber: '123',
    companyName: 'Test company',
    correspondenceAddress: {
      addressLine1: 'Test line 1',
      addressLine2: 'Test line 2',
      addressLine3: 'Test line 3',
      locality: 'Test locality',
      postalCode: 'Test postcode',
      country: 'Test country',
    },
    createdAt: 1625827333468,
    industries: [
      {
        code: '1009',
        name: 'Information and communication',
        class: {
          code: '62020',
          name: 'Information technology consultancy activities',
        },
      },
    ],
    probabilityOfDefault: 14,
    registeredAddress: {
      organisationName: null,
      addressLine1: 'First line',
      addressLine2: null,
      addressLine3: null,
      locality: 'London',
      postalCode: 'SW1A 2HQ',
      country: 'United Kingdom',
    },
    selectedIndustry: {
      code: '1009',
      name: 'Information and communication',
      class: {
        code: '62020',
        name: 'Information technology consultancy activities',
      },
    },
    smeType: 'MEDIUM',
    updatedAt: 162582748022,
  },
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'maker1@ukexportfinance.gov.uk',
      'checker1@ukexportfinance.gov.uk',
    ],
  },
  mandatoryVersionId: null,
  status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.SUBMITTED_TO_UKEF,
  ukefDealId: '123',
  updatedAt: null,
  maker: MOCK_USERS[0],
  checkerId: '60a705d74bf03d1300d96383',
  comments: [
    {
      createdAt: 1625482095783,
      userName: 'Sample User',
      comment: 'Sample comment',
    },
  ],
  facilities: MOCK_CASH_CONTINGENT_FACILITIES,
  supportingInformation: {
    securityDetails: {
      exporter: 'mock security',
    },
  },
  eligibility: {
    status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.COMPLETED,
    updatedAt: 1634835561860.0,
    criteria: [
      {
        id: 12,
        name: 'coverStart',
        text: 'The period between the Cover Start Date and the Cover End Date does not exceed the Facility Maximum Cover Period.',
        errMsg: 'Select if the Maximum Cover period has been exceeded',
        answer: true,
      },
      {
        id: 13,
        name: 'noticeDate',
        text: 'The period between the Inclusion Notice Date and the Requested Cover Start Date does not exceed 3 months (or such longer period as may be agreed by UK Export Finance).',
        errMsg: 'Select if the period between the Inclusion Notice Date and the Requested Cover Start Date exceeds 3 months (or any other period agreed by UK Export Finance)',
        answer: true,
      },
      {
        id: 14,
        name: 'facilityLimit',
        text: 'The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:',
        textList: [
          'the Available Master Guarantee Limit; and',
          'the Available Obligor\'s limit',
        ],
        errMsg: 'Select if the Covered Facility Limit is not more than the lowest of either of the 2 options',
        answer: true,
      },
      {
        id: 15,
        name: 'exporterDeclaration',
        text: 'The  Bank  has  received  an  Exporter  Declaration  which  confirms  that  the  Exporter  is  not involved  with  any  of  the  following  industry  sectors:  sharp  arms  defence,  nuclear radiological, biological, human cloning, pornography, gambling, tobacco, coal, oil, gas or fossil fuel energy and the Bank Team is not aware that any information contained in that Exporter Declaration is inaccurate in any material respect.',
        errMsg: 'Select if the Bank has received an Exporter Declaration and the Exporter is not involved in any of the listed sectors',
        answer: true,
      },
      {
        id: 16,
        name: 'dueDiligence',
        text: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence  internally  to  any  Relevant  Person  for  approval  as  part  of  its  usual  Bank  Due Diligence.',
        errMsg: 'Select if the Bank has completed its Due Diligence',
        answer: true,
      },
      {
        id: 17,
        name: 'facilityLetter',
        text: 'Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee:',
        textList: [
          'has been set in accordance with the Bank\'s normal pricing policies consistently applied;',
          'has been set in accordance with the overall minimum pricing requirements, if any, most recently notified by UK Export Finance to the Bank;',
          '(where the Covered Facility Limit in relation to the Facility is more than the Available Obligor(s) Limit) has been set in accordance with the overall pricing requirements, if any, most recently notified by UK Export Finance to the Bank for the relevant Obligor(s); and',
          '(in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee cover the whole Cover Period of the Covered Facility',
        ],
        errMsg: 'Select if the Facility Letter satisfies the following conditions',
        answer: true,
      },
      {
        id: 18,
        name: 'facilityBaseCurrency',
        text: 'Facility Base Currency satisfies the following conditions: is denominated in an Approved Payment Currency.',
        errMsg: 'Select if the Facility Base Currency satisfies the condition',
      },
      {
        id: 19,
        name: 'facilityPaymentCurrency',
        text: 'Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee, is denominated in an Approved Payment Currency.',
        errMsg: 'Select if the Facility Letter satisfies the condition',
        answer: true,
      },
    ],
  },
};

module.exports = MOCK_GEF_DEAL;
