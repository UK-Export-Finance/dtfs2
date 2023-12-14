const formatCountriesForGDSComponent = (countries, selectedCountryCode, showSelectLabel) => {
  const countryOptions = countries.map((c) => ({
    value: c.code,
    text: c.name,
    selected: c.code === selectedCountryCode,
  }));

  const selectLabel = {
    value: '',
    text: '- Select -',
  };

  if (showSelectLabel) {
    return [selectLabel].concat(countryOptions);
  }
  return countryOptions;
};

module.exports = formatCountriesForGDSComponent;
