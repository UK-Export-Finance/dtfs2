// add a 'value' property so it plays nicely with GDS select macro
// add selected value if id matches a given selectedIndustrySector
// also add empty first option for design.

const mapIndustrySectors = (industrySectors, selectedIndustrySector) => {
  const selectedIndustrySectorCode = selectedIndustrySector && selectedIndustrySector.code ? selectedIndustrySector.code : '';

  const mappedSectors = [
    { text: 'Select value' },
    ...industrySectors.map((sourceSector) => {
      const sector = {
        value: sourceSector.code,
        text: sourceSector.name,
        selected: selectedIndustrySectorCode === sourceSector.code,
      };
      return sector;
    }),
  ];
  return mappedSectors;
};
module.exports = mapIndustrySectors;
