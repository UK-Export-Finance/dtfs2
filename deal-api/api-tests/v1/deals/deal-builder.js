module.exports = (overrides) => {
  // some default json. Could be an actual deal; at time of writing we just need 'some json'..
  return {
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
    // TODO: remove supplyContractCurrency once we have 'About Supply Contract' submitting this value
    supplyContractCurrency: {
      id: 'GBP',
      text: 'GBP - UK Sterling',
    },
    ...overrides,
  };
};
