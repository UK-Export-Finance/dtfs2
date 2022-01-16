import Chance from 'chance';

import dateConstants from '../dateConstants';
import {
  DEAL_STATUS, DEAL_SUBMISSION_TYPE, DEAL_TYPE,
} from '../constants';

const chance = new Chance();

const eligibilityCriteria = (type) => (
  {
    criteria: [{
      id: 12,
      name: 'coverStart',
      text: 'The period between the Cover Start Date and the Cover End Date does not exceed the Facility Maximum Cover Period.',
      errMsg: 'Select if the Maximum Cover period has been exceeded',
      answer: true,
    }, {
      id: 13,
      name: 'noticeDate',
      text: 'The period between the Inclusion Notice Date and the Requested Cover Start Date does not exceed 3 months (or such longer period as may be agreed by UK Export Finance).',
      errMsg: 'Select if the period between the Inclusion Notice Date and the Requested Cover Start Date exceeds 3 months (or any other period agreed by UK Export Finance)',
      answer: true,
    }, {
      id: 14,
      name: 'facilityLimit',
      text: 'The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:',
      textList: ['the Available Master Guarantee Limit; and', "the Available Obligor's limit"],
      errMsg: 'Select if the Covered Facility Limit is not more than the lowest of either of the 2 options',
      answer: true,
    }, {
      id: 15,
      name: 'exporterDeclaration',
      text: 'The  Bank  has  received  an  Exporter  Declaration  which  confirms  that  the  Exporter  is  not involved  with  any  of  the  following  industry  sectors:  sharp  arms  defence,  nuclear radiological, biological, human cloning, pornography, gambling, tobacco, coal, oil, gas or fossil fuel energy and the Bank Team is not aware that any information contained in that Exporter Declaration is inaccurate in any material respect.',
      errMsg: 'Select if the Bank has received an Exporter Declaration and the Exporter is not involved in any of the listed sectors',
      answer: true,
    }, {
      id: 16,
      name: 'dueDiligence',
      text: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence  internally  to  any  Relevant  Person  for  approval  as  part  of  its  usual  Bank  Due Diligence.',
      errMsg: 'Select if the Bank has completed its Due Diligence',
      answer: true,
    }, {
      id: 17,
      name: 'facilityLetter',
      text: 'Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee:',
      textList: ["has been set in accordance with the Bank's normal pricing policies consistently applied;", 'has been set in accordance with the overall minimum pricing requirements, if any, most recently notified by UK Export Finance to the Bank;', '(where the Covered Facility Limit in relation to the Facility is more than the Available Obligor(s) Limit) has been set in accordance with the overall pricing requirements, if any, most recently notified by UK Export Finance to the Bank for the relevant Obligor(s); and', '(in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee cover the whole Cover Period of the Covered Facility'],
      errMsg: 'Select if the Facility Letter satisfies the following conditions',
      answer: true,
    }, {
      id: 18,
      name: 'facilityBaseCurrency',
      text: 'Facility Base Currency satisfies the following conditions: is denominated in an Approved Payment Currency.',
      errMsg: 'Select if the Facility Base Currency satisfies the condition',
      answer: true,
    }, {
      id: 19,
      name: 'facilityPaymentCurrency',
      text: 'Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee, is denominated in an Approved Payment Currency.',
      errMsg: 'Select if the Facility Letter satisfies the condition',
      answer: type,
    }],
    updatedAt: 1638535562287,
    status: 'COMPLETED',
  }
);

const commonApplicationDetails = {
  dealType: DEAL_TYPE.GEF,
  bank: { id: '9' },
  bankInternalRefName: 'Mock ref name',
  mandatoryVersionId: null,
  createdAt: 1638363403942,
  updatedAt: 1638983294975,
  submissionCount: 1,
  submissionDate: `${dateConstants.threeDaysAgoUnix}503`,
  ukefDealId: '0030113304',
  checkerId: '619bae3467cc7c002069fc21',
  editedBy: ['619bae3467cc7c002069fc1e'],
  additionalRefName: 'Mock additional ref name',
  facilitiesUpdated: 1638542220497,
  comments: [],
  previousStatus: DEAL_STATUS.UKEF_IN_PROGRESS,
  id: '61a7710b2ae62b0013dae687',
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
  facilities: {
    status: 'COMPLETED',
    items: [],
  },
  exporterStatus: { text: 'Completed', class: 'govuk-tag--green', code: 'COMPLETED' },
  eligibilityCriteriaStatus: { text: 'Completed', class: 'govuk-tag--green', code: 'COMPLETED' },
  facilitiesStatus: { text: 'Completed', class: 'govuk-tag--green', code: 'COMPLETED' },
  supportingInfoStatus: { text: 'Completed', class: 'govuk-tag--green', code: 'COMPLETED' },
  canSubmit: false,
  checkerCanSubmit: false,
  maker: {
    username: 'BANK1_MAKER1',
    firstname: 'ABC',
    surname: 'DEF',
    email: 'test',
    roles: [],
    bank: {},
    timezone: 'Europe/London',
    lastLogin: '1638807320335',
    'user-status': 'active',
    _id: '619bae3467cc7c002069fc1e',
  },
  checker: {
    username: 'BANK1_CHECKER1',
    firstname: 'DEF',
    surname: 'GHJ',
    email: 'test2',
    roles: ['maker'],
    bank: {},
    timezone: 'Europe/London',
    lastLogin: '1638964634607',
    'user-status': 'active',
    _id: '619bae3467cc7c002069fc21',
  },
};

export const MOCK_APPLICATION_AIN = {
  status: DEAL_STATUS.UKEF_ACKNOWLEDGED,
  submissionType: DEAL_SUBMISSION_TYPE.AIN,
  ukefDecisionAccepted: true,
  eligibility: eligibilityCriteria(true),
  supportingInformation: {
    manualInclusion: [],
    securityDetails: {},
    status: 'IN_PROGRESS',
    requiredFields: [],
  },
  ukefDecision: [],
  ...commonApplicationDetails,
};

export const MOCK_APPLICATION_MIN = {
  status: DEAL_STATUS.UKEF_ACKNOWLEDGED,
  submissionType: DEAL_SUBMISSION_TYPE.MIN,
  ukefDecisionAccepted: true,
  eligibility: eligibilityCriteria(false),
  supportingInformation: {
    manualInclusion: [
      {
        _id: '61d71890a018210013a91c53',
        parentId: '61d7185aa018210013a91c51',
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        encoding: '7bit',
        size: 28583,
        documentPath: 'manualInclusion',
      },
    ],
    securityDetails: { exporter: '456465', application: '4564' },
    status: 'In progress',
    requiredFields: ['manualInclusion'],
  },
  ukefDecision: [],
  ...commonApplicationDetails,
};

export const MOCK_APPLICATION_MIA = {
  status: DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
  submissionType: DEAL_SUBMISSION_TYPE.MIA,
  ukefDecisionAccepted: false,
  eligibility: eligibilityCriteria(false),
  supportingInformation: {
    manualInclusion: [
      {
        _id: '61d71890a018210013a91c53',
        parentId: '61d7185aa018210013a91c51',
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        encoding: '7bit',
        size: 28583,
        documentPath: 'manualInclusion',
      },
    ],
    securityDetails: { exporter: '456465', application: '4564' },
    status: 'In progress',
    requiredFields: ['manualInclusion'],
  },
  ...commonApplicationDetails,
};

export const UKEF_DECISION = {
  text: '1\r\n2\r\n3',
  decision: 'Accepted by UKEF (with conditions)',
};
