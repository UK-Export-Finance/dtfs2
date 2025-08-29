// add a 'value' property so it plays nicely with GDS select macro
// add selected value if id matches a given selectedCurrency
// also add empty first option for design.

const mapCurrencies = (currencies, selectedCurrency) => {
  const mappedCurrencies = [
    { text: 'Select value' },
    ...currencies.map((c) => {
      const currency = {
        value: c.id,
        text: c.text,
        selected: selectedCurrency && selectedCurrency.id === c.id,
      };
      return currency;
    }),
  ];
  return mappedCurrencies;
};

module.exports = mapCurrencies;
