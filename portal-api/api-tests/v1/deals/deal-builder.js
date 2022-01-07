module.exports = (overrides) => {
  // some default json. Could be an actual deal; at time of writing we just need 'some json'..
  return {
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    exporter: {
      companyName: 'mock company',
    },
    ...overrides,
  };
};
