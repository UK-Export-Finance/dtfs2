const { EXPORTER_COMPLETED } = require('./exporter');

const APPLICATION = [{
  // not started
  bankId: '9',
  bankInternalRefName: 'Barclays 123',
  additionalRefName: null,
  mandatoryVersionId: '123', // further down the line you may want exact mongoIDs
  exporter: EXPORTER_COMPLETED,
}, {
  // in progress
  bankId: '9',
  bankInternalRefName: 'UKEF Test 123',
  additionalRefName: '',
  mandatoryVersionId: '123',
  exporter: EXPORTER_COMPLETED,
}, {
  // completed
  bankId: '9',
  bankInternalRefName: 'HSBC 123',
  additionalRefName: 'Some Additional Reference',
  mandatoryVersionId: '123',
  exporter: EXPORTER_COMPLETED,
}];

module.exports = APPLICATION;
