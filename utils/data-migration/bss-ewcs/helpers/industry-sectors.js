const api = require('../../api');

let industrySectors;

const initIndustrySectors = async (token) => {
  industrySectors = await api.listIndustrySectors(token);
  return industrySectors;
};

const getIndustrySectorByCode = (code = '', logError) => {
  const v2IndustrySector = industrySectors.find((c) => c.code.toString() === code.toString());

  if (!v2IndustrySector) {
    logError(`Industry Sector Code: ${code} did not map to v2`);
    return false;
  }

  return v2IndustrySector;
};

const getIndustryClassByCode = (industrySectorClasses, code = '', logError) => {
  const industryClass = industrySectorClasses.find((sourceClass) =>
    sourceClass.code === code);

  if (!industryClass) {
    logError(`Industry Class Code: ${code} did not map to v2`);
    return false;
  }

  return industryClass;
};

module.exports = {
  initIndustrySectors,
  getIndustrySectorByCode,
  getIndustryClassByCode,
};
