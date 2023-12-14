const updatedECPartial = {
  'criterion-11': 'true',
  'criterion-12': 'true',
  'criterion-14': 'false',
};

const updatedECCompleted = {
  'criterion-11': 'true',
  'criterion-12': 'true',
  'criterion-13': 'true',
  'criterion-14': 'true',
  'criterion-15': 'false',
  'criterion-16': 'true',
  'criterion-17': 'true',
  'criterion-18': 'true',
};

const updatedECCompletedAllTrue = {
  'criterion-11': 'true',
  'criterion-12': 'true',
  'criterion-13': 'true',
  'criterion-14': 'true',
  'criterion-15': 'true',
  'criterion-16': 'true',
  'criterion-17': 'true',
  'criterion-18': 'true',
};

const updatedECCriteria11NoExtraInfo = {
  'criterion-11': 'false',
  'criterion-12': 'true',
  'criterion-14': 'false',
};

const updatedECCriteria11WithExtraInfo = {
  ...updatedECCriteria11NoExtraInfo,
  agentName: 'Agent Name',
  agentAddressCountry: 'GBR',
  agentAddressLine1: 'Address 1',
  agentAddressLine2: 'Address 2',
  agentAddressLine3: 'Address 3',
  agentAddressTown: 'Town',
  agentAddressPostcode: 'AA1 2BB',
};

const criteria11ExtraInfo = {
  agentName: 'Agent Name',
  agentAddressCountry: {
    code: 'GBR',
    name: 'United Kingdom',
  },
  agentAddressLine1: 'Address 1',
  agentAddressLine2: 'Address 2',
  agentAddressLine3: 'Address 3',
  agentAddressTown: 'Town',
  agentAddressPostcode: 'AA1 2BB',
};

const criteria11ExtraInfoEmpty = {
  agentName: '',
  agentAddressCountry: '',
  agentAddressLine1: '',
  agentAddressLine2: '',
  agentAddressLine3: '',
  agentAddressTown: '',
  agentAddressPostcode: '',
};

module.exports = {
  updatedECPartial,
  updatedECCompleted,
  updatedECCompletedAllTrue,
  updatedECCriteria11NoExtraInfo,
  updatedECCriteria11WithExtraInfo,
  criteria11ExtraInfo,
  criteria11ExtraInfoEmpty,
};
