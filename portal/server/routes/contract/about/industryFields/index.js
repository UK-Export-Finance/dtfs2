const { getIndustrySectorById, getIndustryClassById } = require('../getIndustryById');

const industryFields = (postedSubmissionDetails, industrySectors) => {
  const submissionDetails = postedSubmissionDetails;

  const industrySectorCode = submissionDetails['industry-sector'];

  let industrySectorObj;

  if (industrySectorCode) {
    industrySectorObj = getIndustrySectorById(industrySectors, industrySectorCode);

    submissionDetails['industry-sector'] = {
      code: industrySectorCode,
      name: getIndustrySectorById(industrySectors, industrySectorCode).name,
    };
  } else {
    submissionDetails['industry-sector'] = {};
  }

  // get industry class object from the submitted industry class code
  const industryClassCode = submissionDetails['industry-class'];

  if (industryClassCode && industrySectorObj.classes) {
    submissionDetails['industry-class'] = {
      code: industryClassCode,
      name: getIndustryClassById(industrySectorObj.classes, industryClassCode).name,
    };
  } else {
    submissionDetails['industry-class'] = {};
  }

  return submissionDetails;
};

module.exports = industryFields;
