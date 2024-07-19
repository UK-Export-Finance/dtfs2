import { ObjectId } from 'mongodb';

/**
 * NOTE: If you change this fixture, then a migration needs to be run on production.
 * This function creates a version 0 GEF deal, which is used in tests to maintain backwards compatability with in-flight deals.
 * Therefore, if you find yourself needing to change this, then existing version 0 GEF deals will also need updating.
 */
export const generateVersion0GefDealDatabaseDocument = (maker: { _id: ObjectId | string; bank: object }) => ({
  dealType: 'GEF',
  version: 0,
  maker,
  status: 'Draft',
  bank: maker.bank,
  exporter: {
    status: 'Not started',
    updatedAt: 1718813828336,
  },
  eligibility: {
    _id: new ObjectId('6672bf13be6003a066426d87'),
    version: 2.1,
    product: 'GEF',
    isInDraft: false,
    criteria: [
      {
        id: 12,
        name: 'coverStart',
        text: 'The period between the Cover Start Date and the Cover End Date does not exceed the Facility Maximum Cover Period.',
        errMsg: 'Select if the Maximum Cover period has been exceeded',
        answer: null,
      },
      {
        id: 13,
        name: 'noticeDate',
        text: 'The period between the Inclusion Notice Date and the Requested Cover Start Date does not exceed 3 months (or such longer period as may be agreed by UK Export Finance).',
        errMsg:
          'Select if the period between the Inclusion Notice Date and the Requested Cover Start Date exceeds 3 months (or any other period agreed by UK Export Finance)',
        answer: null,
      },
      {
        id: 14,
        name: 'facilityLimit',
        text: 'The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:',
        textList: ['the Available Master Guarantee Limit; and', "the Available Obligor's limit"],
        errMsg: 'Select if the Covered Facility Limit is not more than the lowest of either of the 2 options',
        answer: null,
      },
      {
        id: 15,
        name: 'exporterDeclaration',
        text: 'The  Bank  has  received  an  Exporter  Declaration  which  confirms  that  the  Exporter  is  not involved  with  any  of  the  following  industry  sectors:  sharp  arms  defence,  nuclear radiological, biological, human cloning, pornography, gambling, tobacco, coal, oil, gas or fossil fuel energy and the Bank Team is not aware that any information contained in that Exporter Declaration is inaccurate in any material respect.',
        errMsg: 'Select if the Bank has received an Exporter Declaration and the Exporter is not involved in any of the listed sectors',
        answer: null,
      },
      {
        id: 16,
        name: 'revenueThreshold',
        text: "The Bank has received an Exporter Declaration which confirms that the Exporter's Revenue Threshold Test Percentage (as defined in the relevant Exporter Declaration) is below 5%.",
        errMsg:
          "Select if the Bank has received an Exporter Declaration which confirms that the Exporter's Revenue Threshold Test Percentage (as defined in the relevant Exporter Declaration) is below 5%.",
        answer: null,
      },
      {
        id: 17,
        name: 'dueDiligence',
        text: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence  internally  to  any  Relevant  Person  for  approval  as  part  of  its  usual  Bank  Due Diligence.',
        errMsg: 'Select if the Bank has completed its Due Diligence',
        answer: null,
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
        answer: null,
      },
      {
        id: 19,
        name: 'facilityBaseCurrency',
        text: 'Facility Base Currency satisfies the following conditions: is denominated in an Approved Payment Currency.',
        errMsg: 'Select if the Facility Base Currency satisfies the condition',
        answer: null,
      },
      {
        id: 20,
        name: 'facilityPaymentCurrency',
        text: 'Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee, is denominated in an Approved Payment Currency.',
        errMsg: 'Select if the Facility Letter satisfies the condition',
        answer: null,
      },
      {
        id: 21,
        name: 'additionalFacility',
        text: 'The Bank has received an Exporter Declaration which confirms that no Obligor has entered or intends to enter into any Additional UKEF Supported Facility (as defined in the relevant Exporter Declaration) within three months of the date of such Exporter Declaration and the Bank Team is not aware that any information contained in that Exporter Declaration is inaccurate in any material respect.',
        errMsg: 'Select if the Obligor is involved in any additional UKEF supported facility',
        answer: null,
      },
    ],
    createdAt: 1701701238684,
    auditRecord: {
      lastUpdatedAt: '2024-06-19T11:20:51.315 +00:00',
      lastUpdatedByPortalUserId: new ObjectId('6672bf0dbe6003a066426d3b'),
      lastUpdatedByTfmUserId: null,
      lastUpdatedByIsSystem: null,
      noUserLoggedIn: null,
    },
  },
  bankInternalRefName: 'Version 0 Deal',
  mandatoryVersionId: 33,
  createdAt: 1718813828343,
  updatedAt: 1718813828343,
  submissionType: null,
  submissionCount: 0,
  submissionDate: null,
  supportingInformation: {},
  ukefDealId: null,
  checkerId: null,
  editedBy: [String(maker._id)],
  additionalRefName: 'Team 1',
  facilitiesUpdated: null,
  portalActivities: [],
  auditRecord: {
    lastUpdatedAt: '2024-06-19T16:17:08.343 +00:00',
    lastUpdatedByPortalUserId: new ObjectId(maker._id),
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  },
});

/**
 * NOTE: If you change this fixture, then a migration needs to be run on production.
 * This function creates an unissued cash facility for a version 0 GEF deal, which is used in tests to maintain backwards compatability with in-flight facilities.
 * Therefore, if you find yourself needing to change this, then existing version 0 GEF facilities will also need updating.
 */
export const generateVersion0GefFacilityDatabaseDocument = (dealId: ObjectId) => ({
  dealId,
  type: 'Cash',
  hasBeenIssued: false,
  name: null,
  shouldCoverStartOnSubmission: null,
  coverStartDate: null,
  coverEndDate: null,
  issueDate: null,
  monthsOfCover: null,
  details: null,
  detailsOther: null,
  currency: null,
  value: null,
  coverPercentage: null,
  interestPercentage: null,
  paymentType: null,
  createdAt: 1718813828406,
  updatedAt: 1718813828406,
  ukefExposure: 0,
  guaranteeFee: 0,
  submittedAsIssuedDate: null,
  ukefFacilityId: null,
  feeType: null,
  feeFrequency: null,
  dayCountBasis: null,
  coverDateConfirmed: null,
  hasBeenIssuedAndAcknowledged: null,
  canResubmitIssuedFacilities: null,
  unissuedToIssuedByMaker: {},
  auditRecord: {
    lastUpdatedAt: '2024-06-19T16:17:08.406 +00:00',
    lastUpdatedByPortalUserId: new ObjectId('66730483ae34b46b2ec55b1c'),
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  },
});
