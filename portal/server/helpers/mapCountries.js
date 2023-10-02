// add a 'value' property so it plays nicely with GDS select macro
// add selected value if id matches a given selectedCurrency
// also add empty first option for design.

const mapCountries = (countries, selectedCountry) => {
  const mappedCountries = [
    ...countries.map((c) => {
      const country = {
        value: c.code,
        text: c.name,
        selected: selectedCountry === c.code,
      };
      return country;
    }),
  ];

  return mappedCountries;
};

module.exports = mapCountries;
