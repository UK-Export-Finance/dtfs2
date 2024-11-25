const { EXPORTER_COMPLETED, EXPORTER_NO_INDUSTRIES } = require('./exporter');
const { BANK1_MAKER1 } = require('../portal-users');

const APPLICATION = [
  {
    // not started
    bank: { id: '9' },
    bankInternalRefName: 'Barclays 123',
    additionalRefName: null,
    mandatoryVersionId: 33,
    exporter: EXPORTER_COMPLETED,
    maker: BANK1_MAKER1,
  },
  {
    // in progress
    bank: { id: '9' },
    bankInternalRefName: 'UKEF Test 123',
    additionalRefName: '',
    mandatoryVersionId: 33,
    exporter: EXPORTER_NO_INDUSTRIES,
    maker: BANK1_MAKER1,
  },
  {
    // completed
    bank: { id: '9' },
    bankInternalRefName: 'HSBC 123',
    additionalRefName: 'Some Additional Reference',
    mandatoryVersionId: 33,
    exporter: EXPORTER_COMPLETED,
    maker: BANK1_MAKER1,
  },
  {
    // in progress - no exporter
    bank: { id: '9' },
    bankInternalRefName: 'UKEF Test 123',
    additionalRefName: '',
    mandatoryVersionId: 33,
    exporter: {},
    maker: BANK1_MAKER1,
  },
];

module.exports = APPLICATION;
