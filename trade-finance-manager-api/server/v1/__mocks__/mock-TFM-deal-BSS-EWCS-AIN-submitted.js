const { CURRENCY, FACILITY_TYPE, ACTIVITY_TYPES } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../constants');

const MOCK_TFM_DEAL_BSS_EWCS_AIN_SUBMITTED = {
  _id: '61f94a2427c1a7009cde1b9f',
  dealSnapshot: {
    _id: { $oid: '61f94a2427c1a7009cde1b9f' },
    additionalRefName: null,
    bank: {
      companiesHouseNo: 'UKEF0001',
      emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
      id: '9',
      mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
      name: 'UKEF test bank (Delegated)',
      partyUrn: '00318345',
    },
    bankInternalRefName: 'abc',
    checkerId: '61f29adb6851c10012604bd1',
    createdAt: 1643727396847,
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    details: {
      ukefDealId: '0030113304',
      submissionCount: 1,
    },
    submissionDetails: {
      'industry-sector': {
        code: '1008',
        name: 'Accommodation and food service activities',
      },
      'supplier-companies-house-registration-number': 'SC467044',
      'supplier-name': 'TEST SERVICES LTD',
    },
    editedBy: ['61f29adb6851c10012604bce'],
    exporter: {
      companiesHouseRegistrationNumber: 'SC467044',
      companyName: 'TEST SERVICES LTD',
      industries: [
        {
          code: '1008',
          name: 'Accommodation and food service activities',
          class: { code: '56101', name: 'Licensed restaurants' },
        },
      ],
    },
    facilities: [
      {
        _id: { $oid: '61f94a4327c1a7009cde1b9e' },
        dealId: { $oid: '61f94a2427c1a7009cde1b9f' },
        type: FACILITY_TYPE.BOND,
        hasBeenIssued: true,
        name: 'abc',
        currency: { id: CURRENCY.GBP },
        value: 1000,
        coverPercentage: 80,
        ukefExposure: 800,
        ukefFacilityId: '0030184096',
        createdAt: 1643727427189,
        updatedAt: 1643727452524,
      },
    ],
    maker: {
      _id: '61f29adb6851c10012604bce',
      bank: {
        companiesHouseNo: 'UKEF0001',
        emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
        id: '9',
        mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
        name: 'UKEF test bank (Delegated)',
        partyUrn: '00318345',
      },
      email: 'maker1@ukexportfinance.gov.uk',
      firstname: 'First',
      roles: ['maker'],
      surname: 'Last',
      timezone: 'Europe/London',
      'user-status': 'active',
      username: 'maker1@ukexportfinance.gov.uk',
    },
    portalActivities: [],
    status: CONSTANTS.DEALS.PORTAL_DEAL_STATUS.SUBMITTED_TO_UKEF,
    submissionCount: 1,
    submissionDate: '1643727452025',
    submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
    updatedAt: 1643727452024,
  },
  tfm: {
    activities: [
      {
        type: ACTIVITY_TYPES.ACTIVITY,
        timestamp: 1643727515,
        author: {
          firstName: 'UKEF test bank (Delegated)',
          lastName: '9',
          _id: '',
        },
        text: '',
        label: 'Automatic inclusion notice submitted',
      },
    ],
    dateReceived: '01-02-2022',
    exporterCreditRating: 'Acceptable (B+)',
    lastUpdated: 1643727640957,
    lossGivenDefault: 50,
    parties: {
      agent: { partyUrn: '', partyUrnRequired: false },
      buyer: { partyUrn: '', partyUrnRequired: false },
      exporter: { partyUrn: '00307249', partyUrnRequired: true },
      indemnifier: { partyUrn: '', partyUrnRequired: false },
    },
    probabilityOfDefault: 1,
    product: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    stage: 'Confirmed',
    estore: {},
    tasks: [],
  },
};

module.exports = MOCK_TFM_DEAL_BSS_EWCS_AIN_SUBMITTED;
