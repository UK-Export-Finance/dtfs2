// add a 'value' property so it plays nicely with GDS select macro
// add selected value if id matches a given selectedCurrency
// also add empty first option for design.
const mapCountries = (countries, selectedCountry) => {
  const mappedCountries = [
    ...countries.map((country) => {
      const mappedCountry = {
        value: country.code,
        text: country.name,
        selected: selectedCountry === country.code,
      };

      return mappedCountry;
    }),
  ];

  return mappedCountries;
};

module.exports = mapCountries;
