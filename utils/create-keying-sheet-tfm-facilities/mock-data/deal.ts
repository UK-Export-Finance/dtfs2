import { ObjectId } from 'mongodb';

/**
 * Creates an active deal that can be used for utilisation reporting testing.
 * It can be replaced by creating a deal manually and then pulling from the mongo db collection.
 * This way we ensure we are inserting a valid deal.
 * @param ukefDealId - ukef deal id to use
 * @param dealId - id of deal
 * @param portalUserId - id of a portal user
 * @returns a deal
 */
export const aDeal = (ukefDealId: string, dealId: ObjectId, portalUserId: ObjectId) => ({
  _id: dealId,
  dealType: 'GEF',
  version: 1,
  maker: {
    username: 'maker1@ukexportfinance.gov.uk',
    roles: ['maker'],
    bank: {
      _id: '650ab55050b176a646bc1835',
      id: '10',
      name: 'UKEF test bank (Delegated) 2',
      mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
      emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
      companiesHouseNo: 'UKEF0001',
      partyUrn: '00318345',
      hasGefAccessOnly: false,
      paymentOfficerTeam: {
        teamName: 'Payment Officer team UKEF test bank (Delegated) 2 feature',
        emails: ['payment-officer1@ukexportfinance.gov.uk', 'payment-officer2@ukexportfinance.gov.uk'],
      },
      utilisationReportPeriodSchedule: [
        {
          startMonth: 12,
          endMonth: 2,
        },
        {
          startMonth: 3,
          endMonth: 5,
        },
        {
          startMonth: 6,
          endMonth: 8,
        },
        {
          startMonth: 9,
          endMonth: 11,
        },
      ],
      isVisibleInTfmUtilisationReports: true,
    },
    firstname: 'Maker',
    surname: 'Maker',
    email: 'maker1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
    disabled: null,
    _id: '669a2617c3cd2f844ef362fa',
    isTrusted: false,
  },
  status: 'Acknowledged',
  bank: {
    _id: '650ab55050b176a646bc1835',
    id: '10',
    name: 'UKEF test bank (Delegated) 2',
    mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
    emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
    hasGefAccessOnly: false,
    paymentOfficerTeam: {
      teamName: 'Payment Officer team UKEF test bank (Delegated) 2 feature',
      emails: ['payment-officer1@ukexportfinance.gov.uk', 'payment-officer2@ukexportfinance.gov.uk'],
    },
    utilisationReportPeriodSchedule: [
      {
        startMonth: 12,
        endMonth: 2,
      },
      {
        startMonth: 3,
        endMonth: 5,
      },
      {
        startMonth: 6,
        endMonth: 8,
      },
      {
        startMonth: 9,
        endMonth: 11,
      },
    ],
    isVisibleInTfmUtilisationReports: true,
  },
  exporter: {
    status: 'Completed',
    companiesHouseRegistrationNumber: '12345678',
    companyName: 'TEST FOR UTILISATION REPORTING',
    registeredAddress: {
      addressLine1: '1st Line of Address',
      addressLine2: '2nd Line of Address',
      locality: 'London',
      postalCode: 'SW1A 1AA',
    },
    industries: [
      {
        code: '1009',
        name: 'Information and communication',
        class: {
          code: '62012',
          name: 'Business and domestic software development',
        },
      },
    ],
    selectedIndustry: {
      code: '1009',
      name: 'Information and communication',
      class: {
        code: '62012',
        name: 'Business and domestic software development',
      },
    },
    correspondenceAddress: null,
    smeType: 'Small',
    probabilityOfDefault: 0.02,
    isFinanceIncreasing: true,
    updatedAt: 1726061292704,
  },
  eligibility: {
    _id: '657985d0131aacdd3c9f096f',
    product: 'GEF',
    version: 2.1,
    isInDraft: false,
    createdAt: 1701701238684,
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
        answer: true,
      },
      {
        id: 21,
        name: 'additionalFacility',
        text: 'The Bank has received an Exporter Declaration which confirms that no Obligor has entered or intends to enter into any Additional UKEF Supported Facility (as defined in the relevant Exporter Declaration) within three months of the date of such Exporter Declaration and the Bank Team is not aware that any information contained in that Exporter Declaration is inaccurate in any material respect.',
        errMsg: 'Select if the Obligor is involved in any additional UKEF supported facility',
        answer: true,
      },
    ],
    updatedAt: 1726061292704,
    status: 'Completed',
  },
  bankInternalRefName: 'TEST FOR UTILISATION REPORTING',
  mandatoryVersionId: 33,
  createdAt: 1726060102767,
  updatedAt: 1726061296588,
  submissionType: 'Automatic Inclusion Notice',
  submissionCount: 1,
  submissionDate: '1726061293119',
  supportingInformation: {
    status: 'Not started',
  },
  ukefDealId,
  checkerId: '66e19aa9673666208812336e',
  editedBy: ['669a2617c3cd2f844ef362fa'],
  additionalRefName: null,
  facilitiesUpdated: 1726061299475,
  portalActivities: [
    {
      type: 'NOTICE',
      timestamp: 1726061293,
      author: {
        firstName: 'Checker',
        lastName: 'Checker',
        _id: '66e19aa9673666208812336e',
      },
      text: '',
      label: 'Automatic inclusion notice submitted to UKEF',
      html: '',
      facilityType: '',
      ukefFacilityId: '',
      facilityId: '',
      maker: '',
      checker: '',
    },
  ],
  auditRecord: {
    lastUpdatedAt: '2024-09-11T13:28:19.402 +00:00',
    lastUpdatedByPortalUserId: portalUserId,
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  },
  previousStatus: 'Submitted',
});
