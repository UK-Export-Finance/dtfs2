exports.getIndustrySectorById = (industrySectors, id) => industrySectors.find((sector) => sector.code === id);

exports.getIndustryClassById = (industrySectorClasses, id) => industrySectorClasses.find((c) => c.code === id);
