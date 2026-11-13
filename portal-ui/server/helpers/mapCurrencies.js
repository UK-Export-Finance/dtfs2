// add a 'value' property so it plays nicely with GDS select macro
// add selected value if id matches a given selectedCurrency
// also add empty first option for design.

const mapCurrencies = (currencies, selectedCurrency) => {
  const mappedCurrencies = [
    { text: 'Select value' },
    ...currencies.map((currency) => {
      const mappedCurrency = {
        value: currency.id,
        text: currency.text,
        selected: selectedCurrency && selectedCurrency.id === currency.id,
      };

      return mappedCurrency;
    }),
  ];
  return mappedCurrencies;
};

module.exports = mapCurrencies;
