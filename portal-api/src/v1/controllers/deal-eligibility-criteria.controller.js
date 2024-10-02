const { findOneDeal, update: updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { getEligibilityErrors, getCriteria11Errors, getEligibilityStatus } = require('../validation/eligibility-criteria');
const { getDocumentationErrors } = require('../validation/eligibility-documentation');
const CONSTANTS = require('../../constants');
const { getCountry } = require('./countries.controller');

/**
 * Retrieves the country object encompassing `name` and `code` for a specified country code.
 * Returns `{}` when either the country code specified is void or upon an unexpected response.
 *
 * @param {string} countryCode - The country code.
 * @returns {Promise<Object>} - The country object with properties 'name' and 'code' returned as a promise.
 */
const countryObject = async (countryCode) => {
  if (!countryCode) {
    console.error('Invalid country code specified %s', countryCode);
    return {};
  }

  const response = await getCountry(countryCode);

  if (!response?.data) {
    console.error('Unexpected response received whilst fetching country with code %o', response);
    return {};
  }

  const { data: country } = response;

  if (!country) {
    return {};
  }

  const { name, code } = country;

  return {
    name,
    code,
  };
};

exports.update = async (req, res) => {
  await findOneDeal(req.params.id, async (deal) => {
    if (!deal) {
      res.status(404).send();
    }

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const {
        eligibility: { criteria },
        supportingInformation = {},
      } = deal;
      let criteriaComplete = true;
      let criteriaAllTrue = true;

      const updatedCriteria = criteria.map((c) => {
        if (typeof req.body[`criterion-${c.id}`] === 'undefined') {
          criteriaAllTrue = false;
          criteriaComplete = false;
          return c;
        }

        criteriaAllTrue = criteriaAllTrue && req.body[`criterion-${c.id}`].toLowerCase() === 'true';

        return {
          ...c,
          answer: req.body[`criterion-${c.id}`].toLowerCase() === 'true',
        };
      });

      const submissionTypeComplete = criteriaComplete ? CONSTANTS.DEAL.SUBMISSION_TYPE.MIA : '';
      const submissionType = criteriaAllTrue ? CONSTANTS.DEAL.SUBMISSION_TYPE.AIN : submissionTypeComplete;

      const validationErrors = getEligibilityErrors(updatedCriteria);
      const documentationErrors = getDocumentationErrors(submissionType, supportingInformation);

      // Special case for criteria 11 - must add agents name & address if criteria 11 === false
      const criteria11 = updatedCriteria.find((c) => c.id === 11);

      const criteria11IsFalse = typeof criteria11.answer !== 'undefined' && criteria11.answer === false;

      const criteria11Additional = {
        agentName: criteria11IsFalse && req.body.agentName ? req.body.agentName.substring(0, 150) : '',
        agentAddressCountry: criteria11IsFalse ? await countryObject(req.body.agentAddressCountry) : '',
        agentAddressLine1: criteria11IsFalse ? req.body.agentAddressLine1 : '',
        agentAddressLine2: criteria11IsFalse ? req.body.agentAddressLine2 : '',
        agentAddressLine3: criteria11IsFalse ? req.body.agentAddressLine3 : '',
        agentAddressTown: criteria11IsFalse ? req.body.agentAddressTown : '',
        agentAddressPostcode: criteria11IsFalse ? req.body.agentAddressPostcode : '',
      };

      const criteria11ValidationErrors = getCriteria11Errors(criteria11Additional, criteria11IsFalse);

      validationErrors.count += criteria11ValidationErrors.count;
      validationErrors.errorList = {
        ...criteria11ValidationErrors.errorList,
        ...validationErrors.errorList,
      };

      const status = getEligibilityStatus({
        criteriaComplete,
        ecErrorCount: validationErrors.count,
        dealFilesErrorCount: documentationErrors.validationErrors.count,
      });

      const updatedDeal = {
        ...deal,
        submissionType,
        details: {
          ...deal.details,
        },
        eligibility: {
          status,
          criteria: updatedCriteria,
          ...criteria11Additional,
          validationErrors,
          lastUpdated: new Date().valueOf(),
        },
        supportingInformation: {
          ...supportingInformation,
          validationErrors: documentationErrors.validationErrors,
        },
      };

      const newReq = {
        params: req.params,
        body: updatedDeal,
        user: req.user,
      };

      updateDeal(newReq, res);
    }
  });
};
