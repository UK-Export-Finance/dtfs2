const { getIndustrySectorById, getIndustryClassById } = require('../getIndustryById');

/**
 * Maps the submitted industry sector and industry class codes to their respective objects containing code and name.
 * If the submitted industry sector or industry class code is not found in the provided industry sectors data, it returns an empty object for that field.
 * @param {Object} postedSubmissionDetails - The submission details containing the submitted industry sector and industry class codes.
 * @param {Array} industrySectors - The array of industry sectors data to map the submitted codes against.
 * @returns {Object} The submission details with mapped industry sector and industry class objects.
 */
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
