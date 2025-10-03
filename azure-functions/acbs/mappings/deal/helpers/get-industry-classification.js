const { HttpStatusCode } = require('axios');
const mdmApi = require('../../../apim-mdm');

const getIndustryClassification = async (industryCode) => {
  const { status, data } = await mdmApi.getACBSIndustrySector(industryCode);

  const industryClassification = status === HttpStatusCode.Ok ? String(data[0].acbsIndustryId).padStart(4, '0') : '0001';

  return industryClassification;
};

module.exports = getIndustryClassification;
