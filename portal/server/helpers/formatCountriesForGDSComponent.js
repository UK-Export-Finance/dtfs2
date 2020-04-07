const formatCountriesForGDSComponent = ((countries, selectedCountryCode) => {
  const countryOptions = countries.map((c) => ({
    value: c.code,
    text: c.name,
    selected: c.code === selectedCountryCode,
  }));
  return countryOptions;
});

export default formatCountriesForGDSComponent;
