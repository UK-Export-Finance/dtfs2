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
  'agent-name': 'Agent Name',
  'agent-country': 'GBR',
  'agent-address-line-1': 'Address 1',
  'agent-address-line-2': 'Address 2',
  'agent-address-line-3': 'Address 3',
  'agent-address-town': 'Town',
  'agent-postcode': 'AA1 2BB',
};

const criteria11ExtraInfo = {
  agentName: 'Agent Name',
  agentCountry: 'GBR',
  agentAddress1: 'Address 1',
  agentAddress2: 'Address 2',
  agentAddress3: 'Address 3',
  agentTown: 'Town',
  agentPostcode: 'AA1 2BB',
};

const criteria11ExtraInfoEmpty = {
  agentName: '',
  agentCountry: '',
  agentAddress1: '',
  agentAddress2: '',
  agentAddress3: '',
  agentTown: '',
  agentPostcode: '',
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
