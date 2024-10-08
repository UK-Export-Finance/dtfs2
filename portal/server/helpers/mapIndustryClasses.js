// add a 'value' property so it plays nicely with GDS select macro
// add selected value if id matches a given selectedIndustryClass
// also add empty first option for design.

const mapIndustryClasses = (industrySectors, selectedIndustrySector, selectedIndustryClass) => {
  const industryClasses = industrySectors.reduce((acc, curr) => {
    if (selectedIndustrySector && selectedIndustrySector.code && selectedIndustrySector.code === curr.code) {
      return acc.concat(curr.classes);
    }
    return acc;
  }, []);

  const selectedIndustryClassCode = selectedIndustryClass && selectedIndustryClass.code ? selectedIndustryClass.code : '';

  const mappedIndustryClasses = [
    { text: 'Select value' },
    ...industryClasses.map((sourceClass) => {
      const industryClass = {
        value: sourceClass.code,
        text: sourceClass.name,
        selected: selectedIndustryClassCode === sourceClass.code,
      };
      return industryClass;
    }),
  ];
  return mappedIndustryClasses;
};

module.exports = mapIndustryClasses;
