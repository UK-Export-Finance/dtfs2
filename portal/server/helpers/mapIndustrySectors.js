// add a 'value' property so it plays nicely with GDS select macro
// add seleted value if id matches a given selectedIndustrySector
// also add empty first option for design.

const mapIndustrySectors = (industrySectors, selectedIndustrySector) => {
  const mappedSectors = [
    { text: 'Select value' },
    ...industrySectors.map((sourceSector) => {
      const sector = {
        value: sourceSector.code,
        text: sourceSector.name,
        selected: selectedIndustrySector === sourceSector.code,
      };
      return sector;
    }),
  ];
  return mappedSectors;
};

export default mapIndustrySectors;
