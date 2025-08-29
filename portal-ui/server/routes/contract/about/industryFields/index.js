const { getIndustrySectorById, getIndustryClassById } = require('../getIndustryById');

const industryFields = (postedSubmissionDetails, industrySectors) => {
  const submissionDetails = postedSubmissionDetails;

  const industrySectorCode = submissionDetails['industry-sector'];

  let industrySectorObj;

  if (!industrySectorCode) {
    submissionDetails['industry-sector'] = {};
  } else {
    industrySectorObj = getIndustrySectorById(industrySectors, industrySectorCode);

    if (industrySectorObj) {
      submissionDetails['industry-sector'] = {
        code: industrySectorCode,
        name: industrySectorObj.name,
      };
    } else {
      /**
       * This is required because - if an industry sector is not found
       * and we save 'industry-sector' as undefined,
       * the validation thinks that it has a valid value.
       * Therefore, if no industry sector is found, the object should be wiped.
       */
      submissionDetails['industry-sector'] = {};
    }
  }

  // get industry class object from the submitted industry class code
  const industryClassCode = submissionDetails['industry-class'];

  if (industryClassCode && industrySectorObj?.classes) {
    const industryClass = getIndustryClassById(industrySectorObj.classes, industryClassCode);

    submissionDetails['industry-class'] = {
      code: industryClassCode,
      name: industryClass?.name,
    };
  } else {
    submissionDetails['industry-class'] = {};
  }

  return submissionDetails;
};

module.exports = industryFields;
