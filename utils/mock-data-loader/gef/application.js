const {
  EXPORTER_COMPLETED,
  EXPORTER_NO_INDUSTRIES,
} = require('./exporter');
const USERS = require('../portal/users');

const MAKER = USERS.find((user) => user.roles.includes('maker'));

const APPLICATION = [{
  // not started
  bank: { id: '9' },
  bankInternalRefName: 'Barclays 123',
  additionalRefName: null,
  mandatoryVersionId: 33,
  exporter: EXPORTER_COMPLETED,
  maker: MAKER,
}, {
  // in progress
  bank: { id: '9' },
  bankInternalRefName: 'UKEF Test 123',
  additionalRefName: '',
  mandatoryVersionId: 33,
  exporter: EXPORTER_NO_INDUSTRIES,
  maker: MAKER,
}, {
  // completed
  bank: { id: '9' },
  bankInternalRefName: 'HSBC 123',
  additionalRefName: 'Some Additional Reference',
  mandatoryVersionId: 33,
  exporter: EXPORTER_COMPLETED,
  maker: MAKER,
}, {
  // in progress - no exporter
  bank: { id: '9' },
  bankInternalRefName: 'UKEF Test 123',
  additionalRefName: '',
  mandatoryVersionId: 33,
  exporter: {},
  maker: MAKER,
}];

module.exports = APPLICATION;
