module.exports = (overrides) => {
  return {
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
    ...overrides,
  };
};
