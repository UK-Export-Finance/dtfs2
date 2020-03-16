module.exports = (template, overrides) => {

  // loop through the provided overrides and override the key/value pairs
  //TODO get clever and let us override 'details.bankSupplyContractID'
  for (key of Object.keys(overrides)) {
    template[key]=overrides[key];
  };

  return template;
}
