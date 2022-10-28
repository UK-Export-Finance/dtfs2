const { mandatoryCriteria, ELIGIBILITY_COMPLETED, SUBMISSION_DETAILS } = require('../../../e2e-fixtures');
const CONSTANTS = require('./constants');

const deal = {
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
  updatedAt: Date.now(),
  bankInternalRefName: 'DTFS2-2815 MIN - pre submit',
  additionalRefName: 'DTFS2-2815 MIN - pre submit',
  status: CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
  previousStatus: CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'maker@ukexportfinance.gov.uk',
      'checker@ukexportfinance.gov.uk',
    ],
  },
  maker: {
    _id: '5f3ab3f705e6630007dcfb25',
    username: 'maker1@ukexportfinance.gov.uk',
    roles: [
      'maker',
    ],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    lastLogin: '1606899737029',
    firstname: 'Hugo',
    surname: 'Drax',
    email: 'maker1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
  },
  details: {
    created: '1606900241023',
    submissionDate: '1606900616651',
    checker: {
      _id: '5f3ab3f705e6630007dcfb29',
      username: 'checker1@ukexportfinance.gov.uk',
      roles: [
        'checker',
      ],
      bank: {
        id: '9',
        name: 'UKEF test bank (Delegated)',
        emails: [
          'maker@ukexportfinance.gov.uk',
          'checker@ukexportfinance.gov.uk',
        ],
      },
      lastLogin: '1606900578887',
      firstname: 'Emilio',
      surname: 'Largo',
      email: 'checker1@ukexportfinance.gov.uk',
      timezone: 'Europe/London',
      'user-status': 'active',
    },
    manualInclusionApplicationSubmissionDate: '1606900616669',
    ukefDealId: '0040004828',
    approvalDate: '1606912140306',
    makerMIN: {
      _id: '5f3ab3f705e6630007dcfb25',
      username: 'maker1@ukexportfinance.gov.uk',
      roles: [
        'maker',
      ],
      bank: {
        id: '9',
        name: 'UKEF test bank (Delegated)',
        emails: [
          'maker@ukexportfinance.gov.uk',
          'checker@ukexportfinance.gov.uk',
        ],
      },
      lastLogin: '1606901020715',
      firstname: 'Hugo',
      surname: 'Drax',
      email: 'maker1@ukexportfinance.gov.uk',
      timezone: 'Europe/London',
      'user-status': 'active',
    },
    manualInclusionNoticeSubmissionDate: '1606912256510',
    checkerMIN: {
      _id: '5f3ab3f705e6630007dcfb29',
      username: 'checker1@ukexportfinance.gov.uk',
      roles: [
        'checker',
      ],
      bank: {
        id: '9',
        name: 'UKEF test bank (Delegated)',
        emails: [
          'maker@ukexportfinance.gov.uk',
          'checker@ukexportfinance.gov.uk',
        ],
      },
      lastLogin: '1606912247772',
      firstname: 'Emilio',
      surname: 'Largo',
      email: 'checker1@ukexportfinance.gov.uk',
      timezone: 'Europe/London',
      'user-status': 'active',
    },
  },
  eligibility: ELIGIBILITY_COMPLETED,
  submissionDetails: SUBMISSION_DETAILS,
  comments: [
    {
      user: {
        _id: '5f3ab3f705e6630007dcfb25',
        username: 'maker1@ukexportfinance.gov.uk',
        roles: [
          'maker',
        ],
        bank: {
          id: '9',
          name: 'UKEF test bank (Delegated)',
          emails: [
            'maker@ukexportfinance.gov.uk',
            'checker@ukexportfinance.gov.uk',
          ],
        },
        lastLogin: '1606912269649',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker1@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1606914139577',
      text: 'test',
    },
    {
      user: {
        _id: '5f3ab3f705e6630007dcfb25',
        username: 'maker1@ukexportfinance.gov.uk',
        roles: [
          'maker',
        ],
        bank: {
          id: '9',
          name: 'UKEF test bank (Delegated)',
          emails: [
            'maker@ukexportfinance.gov.uk',
            'checker@ukexportfinance.gov.uk',
          ],
        },
        lastLogin: '1606901020715',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker1@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1606912233615',
      text: 'test',
    },
    {
      user: {
        _id: '5f3ab3f705e6630007dcfb25',
        username: 'maker1@ukexportfinance.gov.uk',
        roles: [
          'maker',
        ],
        bank: {
          id: '9',
          name: 'UKEF test bank (Delegated)',
          emails: [
            'maker@ukexportfinance.gov.uk',
            'checker@ukexportfinance.gov.uk',
          ],
        },
        lastLogin: '1606899737029',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker1@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1606900373442',
      text: 'DTFS2-2815 MIN - pre submit',
    },
  ],
  mandatoryCriteria,
};

module.exports = deal;
