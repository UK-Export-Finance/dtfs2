const { sub, getUnixTime } = require('date-fns');
const Chance = require('chance');

const CONSTANTS = require('../constants');

const chance = new Chance();
const today = new Date();
const threeDaysAgo = sub(today, { days: 3 });
const threeDaysAgoUnix = getUnixTime(threeDaysAgo).toString();

exports.MOCK_MIN_APPLICATION = {
  dealType: CONSTANTS.DEAL_TYPE.GEF,
  status: CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    mga: [
      'mga_ukef_1.docx',
      'mga_ukef_2.docx',
    ],
    emails: [
      'maker1@ukexportfinance.gov.uk',
      'checker1@ukexportfinance.gov.uk',
    ],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
  },
  exporter: {
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
    status: 'COMPLETED',
  },
  eligibility: {
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
          "the Available Obligor's limit",
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
          "has been set in accordance with the Bank's normal pricing policies consistently applied;",
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
        answer: true,
      },
      {
        id: 19,
        name: 'facilityPaymentCurrency',
        text: 'Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee, is denominated in an Approved Payment Currency.',
        errMsg: 'Select if the Facility Letter satisfies the condition',
        answer: false,
      },
    ],
    updatedAt: 1641395150037,
    status: 'Completed',
  },
  bankInternalRefName: chance.name(),
  mandatoryVersionId: null,
  createdAt: 1641394814757,
  updatedAt: 1641395151219,
  submissionType: CONSTANTS.DEAL_SUBMISSION_TYPE.MIN,
  submissionCount: 2,
  submissionDate: `${threeDaysAgoUnix}503`,
  supportingInformation: {
    manualInclusion: [
      {
        _id: '61d5b2b4bac4cf2b637b28a6',
        parentId: '61d5b27ebac4cf63787b28a5',
        filename: 'File One.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        encoding: '7bit',
        size: 19266,
        documentPath: 'manualInclusion',
      },
    ],
    securityDetails: {
      exporter: 'test',
      application: 'test',
    },
    status: 'In progress',
  },
  ukefDealId: '0040104770',
  checkerId: '617703c5f5cdccb0a1fe02a9',
  editedBy: [
    '617703c4f5cdcc413afe02a6',
  ],
  additionalRefName: null,
  facilitiesUpdated: 1641395150141,
  portalActivities: [
    {
      type: 'NOTICE',
      timestamp: 1641395150,
      author: {
        _id: '617703c5f5cdccb0a1fe02a9',
        firstName: 'Nikolaevich',
        lastName: 'Chernov',
      },
      text: '',
      label: 'Manual inclusion application submitted to UKEF',
    },
    {
      type: 'NOTICE',
      timestamp: 1641395002,
      author: {
        _id: '617703c5f5cdccb0a1fe02a9',
        firstName: 'Nikolaevich',
        lastName: 'Chernov',
      },
      text: '',
      label: 'Manual inclusion application submitted to UKEF',
    },
  ],
  previousStatus: 'Submitted',
  ukefDecision: [
    {
      decision: 'Accepted (without conditions)',
      timestamp: 1641331773,
    },
  ],
  ukefDecisionAccepted: true,
  checkerMIN: {
    _id: '617703c5f5cdccb0a1fe02a9',
    username: 'BANK1_CHECKER1',
    roles: [
      'checker',
    ],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      mga: [
        'mga_ukef_1.docx',
        'mga_ukef_2.docx',
      ],
      emails: [
        'maker1@ukexportfinance.gov.uk',
        'checker1@ukexportfinance.gov.uk',
      ],
      companiesHouseNo: 'UKEF0001',
      partyUrn: '00318345',
    },
    lastLogin: '1641395141825',
    firstname: 'Nikolaevich',
    surname: 'Chernov',
    email: 'checker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
  },
  manualInclusionNoticeSubmissionDate: '1641395150793',
};
