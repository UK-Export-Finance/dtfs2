const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { findOneDeal, updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const validateSubmissionDetails = require('../validation/submission-details');
const { sanitizeCurrency } = require('../../utils/number');
const { getCountry } = require('./countries.controller');
const { getCurrencyObject } = require('../section-currency');
const { FACILITIES } = require('../../constants');

/**
 * Retrieves a deal by its ID and checks if the user has access to it.
 * If the deal is found and the user has access, validates the submission details of the deal and returns them as a response.
 * @param {Object} req - The request object containing information about the HTTP request.
 * @param {Object} res - The response object used to send the HTTP response.
 */
exports.findOne = async (req, res) => {
  try {
    const deal = await findOneDeal(req.params.id);
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      const validationErrors = await validateSubmissionDetails(deal.submissionDetails);
      res.status(200).json({
        validationErrors,
        data: deal.submissionDetails,
      });
    }
  } catch (error) {
    console.error('Unable to validate submission details %o', error);
    res.status(500).send({ status: 500, message: 'Unable to validate submission details' });
  }
};

const updateSubmissionDetails = async (dealId, submissionDetails, user, auditDetails) => {
  const dealUpdate = {
    submissionDetails,
    updatedAt: Date.now(),
  };

  /**
   * Portal BSS UI gives us a field name called supplier-name.
   * This maybe eventually changed to 'exporter name'.
   * Every other service (TFM, ABCS), uses this value
   * as the 'exporter name'.
   * Therefore, we add this value to the deal object under exporter.
   * */
  if (submissionDetails['supplier-name']) {
    dealUpdate.exporter = {
      companyName: submissionDetails['supplier-name'],
    };
  }

  const updateDealResponse = await updateDeal({ dealId, dealUpdate, user, auditDetails });
  return updateDealResponse;
};

const countryObject = async (countryCode) => {
  const { data } = await getCountry(countryCode);

  if (!data) {
    return {};
  }

  const { name, code } = data;

  return {
    name,
    code,
  };
};

const checkCountryCode = async (existingDeal, submitted, fieldName) => {
  const existingCountryCode = existingDeal[fieldName] && existingDeal[fieldName].code;
  const submittedCountryCode = submitted[fieldName];

  const shouldUpdateCountry = !existingCountryCode || existingCountryCode.code !== submittedCountryCode;

  if (shouldUpdateCountry) {
    const countryObj = await countryObject(submittedCountryCode);
    return countryObj;
  }
  return {};
};

const checkAllCountryCodes = async (deal, fields) => {
  const modifiedFields = fields;

  if ('destinationOfGoodsAndServices' in modifiedFields) {
    modifiedFields.destinationOfGoodsAndServices = await checkCountryCode(deal, fields, 'destinationOfGoodsAndServices');
  }

  if ('buyer-address-country' in modifiedFields) {
    modifiedFields['buyer-address-country'] = await checkCountryCode(deal, fields, 'buyer-address-country');
  }

  if ('indemnifier-correspondence-address-country' in modifiedFields) {
    modifiedFields['indemnifier-correspondence-address-country'] = await checkCountryCode(deal, fields, 'indemnifier-correspondence-address-country');
  }

  if ('indemnifier-address-country' in modifiedFields) {
    modifiedFields['indemnifier-address-country'] = await checkCountryCode(deal, fields, 'indemnifier-address-country');
  }

  if ('supplier-address-country' in modifiedFields) {
    modifiedFields['supplier-address-country'] = await checkCountryCode(deal, fields, 'supplier-address-country');
  }

  if ('supplier-correspondence-address-country' in modifiedFields) {
    modifiedFields['supplier-correspondence-address-country'] = await checkCountryCode(deal, fields, 'supplier-correspondence-address-country');
  }

  return modifiedFields;
};

const checkCurrency = async (existingCurrencyObj, submitted) => {
  const hasExistingCurrencyId = existingCurrencyObj?.id;
  const hasSubmittedId = submitted?.id;
  const shouldUpdateCurrency = hasSubmittedId && (!hasExistingCurrencyId || existingCurrencyObj.id !== submitted.id);

  if (shouldUpdateCurrency) {
    const currencyObj = await getCurrencyObject(submitted.id);
    return currencyObj;
  }

  if (hasExistingCurrencyId) {
    return existingCurrencyObj;
  }

  return {};
};

/**
 * Updates a deal with new submission details.
 * @param {Object} req - The request object containing information about the HTTP request.
 * @param {Object} res - The response object used to send the HTTP response.
 */
exports.update = async (req, res) => {
  const {
    user,
    body: submissionDetails,
    params: { id: dealId },
  } = req;

  const auditDetails = generatePortalAuditDetails(user._id);

  try {
    const deal = await findOneDeal(dealId);

    if (!deal) {
      return res.status(404).send();
    }

    if (!userHasAccessTo(user, deal)) {
      return res.status(401).send();
    }

    submissionDetails.status = FACILITIES.DEAL_STATUS.INCOMPLETE;

    const { day, month, year } = submissionDetails.supplyContractConversionDate || {};
    if (day && month && year) {
      submissionDetails.supplyContractConversionDate = `${day}/${month}/${year}`;
    }

    const { sanitizedValue } = sanitizeCurrency(submissionDetails.supplyContractValue);
    if (sanitizedValue) {
      submissionDetails.supplyContractValue = sanitizedValue;
    }

    const submissionDetailsWithUpdatedCountryCodes = await checkAllCountryCodes(deal, submissionDetails);

    if (submissionDetailsWithUpdatedCountryCodes.supplyContractCurrency) {
      submissionDetailsWithUpdatedCountryCodes.supplyContractCurrency = await checkCurrency(
        deal.supplyContractCurrency,
        submissionDetailsWithUpdatedCountryCodes.supplyContractCurrency,
      );
    }

    const dealAfterAllUpdates = await updateSubmissionDetails(dealId, submissionDetailsWithUpdatedCountryCodes, user, auditDetails);

    const validationErrors = await validateSubmissionDetails({ ...dealAfterAllUpdates.submissionDetails, ...req.body });

    const response = {
      validationErrors,
      data: dealAfterAllUpdates.submissionDetails,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Unable to update the deal with submission details %o', error);
    return res.status(500).send({ status: 500, message: 'Unable to update the deal with submission details' });
  }
};
