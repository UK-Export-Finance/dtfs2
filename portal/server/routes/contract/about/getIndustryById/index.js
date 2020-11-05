export const getIndustrySectorById = (industrySectors, id) =>
  industrySectors.find((sector) => sector.code === id);

export const getIndustryClassById = (industrySectorClasses, id) =>
  industrySectorClasses.find((c) => c.code === id);
