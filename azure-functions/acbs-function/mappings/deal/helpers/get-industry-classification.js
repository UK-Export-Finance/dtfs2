const mdmApi = require('../../../api-ukef-mdm-ea');

const getIndustryClassification = (async (industryCode) => {
  const { status, data } = await mdmApi.getACBSIndustrySector(industryCode);

  const industryClassification = status === 200
    ? String(data[0].acbsIndustryId).padStart(4, '0')
    : '0001';

  return industryClassification;
});

module.exports = getIndustryClassification;
