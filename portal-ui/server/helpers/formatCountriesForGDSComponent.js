const formatCountriesForGDSComponent = (countries, selectedCountryCode, showSelectLabel) => {
  const countryOptions = countries.map((country) => ({
    value: country.code,
    text: country.name,
    selected: country.code === selectedCountryCode,
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
