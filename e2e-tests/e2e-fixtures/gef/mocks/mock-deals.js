import Chance from 'chance';
import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, DEAL_TYPE } from '@ukef/dtfs2-common';
import { BANK1_MAKER1 } from '../../portal-users.fixture';

const chance = new Chance();

const eligibilityCriteria = (type) => ({
  version: 2.1,
  isInDraft: false,
  createdAt: 1648073920642.0,
  product: DEAL_TYPE.GEF,
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
      errMsg:
        'Select if the period between the Inclusion Notice Date and the Requested Cover Start Date exceeds 3 months (or any other period agreed by UK Export Finance)',
      answer: true,
    },
    {
      id: 14,
      name: 'facilityLimit',
      text: 'The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:',
      textList: ['the Available Master Guarantee Limit; and', "the Available Obligor's limit"],
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
      name: 'revenueThreshold',
      text: "The Bank has received an Exporter Declaration which confirms that the Exporter's Revenue Threshold Test Percentage (as defined in the relevant Exporter Declaration) is below 5%.",
      errMsg:
        "Select if the Bank has received an Exporter Declaration which confirms that the Exporter's Revenue Threshold Test Percentage (as defined in the relevant Exporter Declaration) is below 5%.",
      answer: true,
    },
    {
      id: 17,
      name: 'dueDiligence',
      text: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence  internally  to  any  Relevant  Person  for  approval  as  part  of  its  usual  Bank  Due Diligence.',
      errMsg: 'Select if the Bank has completed its Due Diligence',
      answer: true,
    },
    {
      id: 18,
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
      id: 19,
      name: 'facilityBaseCurrency',
      text: 'Facility Base Currency satisfies the following conditions: is denominated in an Approved Payment Currency.',
      errMsg: 'Select if the Facility Base Currency satisfies the condition',
      answer: true,
    },
    {
      id: 20,
      name: 'facilityPaymentCurrency',
      text: 'Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee, is denominated in an Approved Payment Currency.',
      errMsg: 'Select if the Facility Letter satisfies the condition',
      answer: type,
    },
    {
      id: 21,
      name: 'additionalFacility',
      text: 'The Bank has received an Exporter Declaration which confirms that no Obligor has entered or intends to enter into any Additional UKEF Supported Facility (as defined in the relevant Exporter Declaration) within three months of the date of such Exporter Declaration and the Bank Team is not aware that any information contained in that Exporter Declaration is inaccurate in any material respect.',
      errMsg: 'Select if the Obligor is involved in any additional UKEF supported facility',
      answer: true,
    },
  ],
  updatedAt: 1638535562287,
  status: DEAL_STATUS.COMPLETED,
});

const commonApplicationDetails = {
  dealType: DEAL_TYPE.GEF,
  status: DEAL_STATUS.DRAFT,
  bank: { id: '9' },
  bankInternalRefName: chance.sentence({ words: 2 }),
  submissionCount: 0,
  submissionDate: null,
  ukefDealId: null,
  checkerId: null,
  additionalRefName: chance.sentence({ words: 3 }),
  portalActivities: [],
  exporter: {
    companiesHouseRegistrationNumber: '06771815',
    companyName: chance.company(),
    registeredAddress: {
      line1: chance.street({ syllables: 8 }),
      line2: chance.address({ short_suffix: true }),
      county: chance.state({ full: true }),
      country: chance.country({ full: true }),
      postcode: chance.postcode(),
    },
    correspondenceAddress: null,
    selectedIndustry: { code: '1003', name: 'Manufacturing', class: { code: '25620', name: 'Machining' } },
    industries: [
      { code: '1003', name: 'Manufacturing', class: { code: '25300', name: 'Manufacture of steam generators, except central heating hot water boilers' } },
      { code: '1003', name: 'Manufacturing', class: { code: '25620', name: 'Machining' } },
      {
        code: '1003',
        name: 'Manufacturing',
        class: { code: '28110', name: 'Manufacture of engines and turbines, except aircraft, vehicle and cycle engines' },
      },
    ],
    smeType: 'Micro',
    probabilityOfDefault: 14,
    isFinanceIncreasing: true,
    status: DEAL_STATUS.COMPLETED,
  },
  facilities: { status: DEAL_STATUS.COMPLETED, items: [] },
  maker: {
    username: BANK1_MAKER1.username,
    firstname: chance.first(),
    surname: chance.last(),
    email: BANK1_MAKER1.email,
    roles: [],
    bank: {},
    timezone: 'Europe/London',
    lastLogin: '1638807320335',
    'user-status': 'active',
    _id: '619bae3467cc7c002069fc1e',
  },
};

export const MOCK_APPLICATION_AIN_DRAFT = {
  submissionType: DEAL_SUBMISSION_TYPE.AIN,
  eligibility: eligibilityCriteria(true),
  supportingInformation: { manualInclusion: [], securityDetails: {}, status: DEAL_STATUS.IN_PROGRESS, requiredFields: [] },
  ukefDecision: [],
  ...commonApplicationDetails,
};

export const MOCK_APPLICATION_MIN_DRAFT = {
  status: DEAL_STATUS.UKEF_ACKNOWLEDGED,
  submissionType: DEAL_SUBMISSION_TYPE.MIN,
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
    status: DEAL_STATUS.IN_PROGRESS,
    requiredFields: ['manualInclusion'],
  },
  ukefDecision: [],
  ...commonApplicationDetails,
};
