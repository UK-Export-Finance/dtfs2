const countriesWithEmptyInitialOption = (countries) => [
  { text: 'Select value', value: '' },
  ...countries,
];

export default countriesWithEmptyInitialOption;
