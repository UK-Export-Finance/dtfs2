const api = require('../api');

let industrySectors;

const initIndustrySectors = async (token) => {
  industrySectors = await api.listIndustrySectors(token);
  return industrySectors;
};

const getIndustrySectorByCode = (code = '') => {
  const v2IndustrySector = industrySectors.find((c) => c.code.toString() === code.toString());
  if (!v2IndustrySector) return {};

  return {
    code: v2IndustrySector.code,
    name: v2IndustrySector.name,
    classes: v2IndustrySector.classes,
  };
};

const getIndustryClassByCode = (industrySectorClasses, code = '') => {
  industrySectorClasses.find((sourceClass) =>
    sourceClass.code === code);
};

module.exports = {
  initIndustrySectors,
  getIndustrySectorByCode,
  getIndustryClassByCode,
};
