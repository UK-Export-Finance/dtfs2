const APPLICATION = [{
  // not started
  bankId: '9',
  bankInternalRefName: 'Barclays 123',
  additionalRefName: null,
  mandatoryVersionId: '123', // further down the line you may want exact mongoIDs
}, {
  // in progress
  bankId: '9',
  bankInternalRefName: 'UKEF Test 123',
  additionalRefName: '',
  mandatoryVersionId: '123',
}, {
  // completed
  bankId: '9',
  bankInternalRefName: 'HSBC 123',
  additionalRefName: 'Some Additional Reference',
  mandatoryVersionId: '123',
}];

module.exports = APPLICATION;
