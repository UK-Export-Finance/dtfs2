// add a 'value' property so it plays nicely with GDS select macro
// also add empty first option for design.

const mapBondCurrencies = (currencies) => {
  const mappedCurrencies = [
    { text: 'Select value' },
    ...currencies.map((c) => {
      const currency = {
        value: c.id,
        text: c.text,
      };
      return currency;
    }),
  ];
  return mappedCurrencies;
};

export default mapBondCurrencies;
