// add a 'value' property so it plays nicely with GDS select macro
// add seleted value if id matches a given selectedIndustryClass
// also add empty first option for design.

const mapIndustryClasses = (industrySectors, selectedIndustrySector, selectedIndustryClass) => {
  const industryClasses = industrySectors.reduce((acc, curr) => {
    if (selectedIndustrySector === curr.code) {
      return acc.concat(curr.classes);
    }
    return acc;
  }, []);

  const mappedIndustryClasses = [
    { text: 'Select value' },
    ...industryClasses.map((sourceClass) => {
      const clazz = {
        value: sourceClass.code,
        text: sourceClass.name,
        selected: selectedIndustryClass === sourceClass.code,
      };
      return clazz;
    }),
  ];
  return mappedIndustryClasses;
};

export default mapIndustryClasses;
