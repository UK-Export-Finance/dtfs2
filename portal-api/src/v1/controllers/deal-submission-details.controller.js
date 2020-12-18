const { findOneDeal, updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const validateSubmissionDetails = require('../validation/submission-details');
const { sanitizeCurrency } = require('../../utils/number');
const now = require('../../now');
const { findOneCountry } = require('./countries.controller');
const { getCurrencyObject } = require('../section-currency');

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      const validationErrors = validateSubmissionDetails(deal.submissionDetails);
      res.status(200).json({
        validationErrors,
        data: deal.submissionDetails,
      });
    }
  });
};

const updateSubmissionDetails = async (dealId, submissionDetails, user) => {
  const update = {
    submissionDetails,
    details: {
      dateOfLastAction: now(),
    },
  };

  const updateDealResponse = await updateDeal(
    dealId,
    update,
    user
  );
  return updateDealResponse;
};

const countryObject = async (countryCode) => {
  const countryObj = await findOneCountry(countryCode);

  if (!countryObj) {
    return {};
  }

  const { name, code } = countryObj;

  return {
    name,
    code,
  };
};

const checkCountryCode = async (existingDeal, submitted, fieldName) => {
  const existingCountryCode = existingDeal[fieldName] && existingDeal[fieldName].code;
  const submittedCountryCode = submitted[fieldName];

  const shouldUpdateCountry = (!existingCountryCode || existingCountryCode.code !== submittedCountryCode);

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
  const hasExistingCurrencyId = existingCurrencyObj && existingCurrencyObj.id;
  const hasSubmittedId = submitted && submitted.id;
  const shouldUpdateCurrency = (hasSubmittedId && (!hasExistingCurrencyId || existingCurrencyObj.id !== submitted.id));
  if (shouldUpdateCurrency) {
    const currencyObj = await getCurrencyObject(submitted.id);
    return currencyObj;
  }
  if (hasExistingCurrencyId) {
    return existingCurrencyObj;
  }
  return {};
};

exports.update = (req, res) => {
  const { user } = req;
  let submissionDetails = req.body;

  findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();
    if (!userHasAccessTo(user, deal)) return res.status(401).send();

    // TODO - we calculate status on the fly now, so should we ever persist this field?
    // if (validationErrors.count === 0) {
    //   submissionDetails.status = 'Completed';
    // } else {
    submissionDetails.status = 'Incomplete';
    // }

    // build a date out of the conversion-date fields if we have them
    const day = submissionDetails['supplyContractConversionDate-day'];
    const month = submissionDetails['supplyContractConversionDate-month'];
    const year = submissionDetails['supplyContractConversionDate-year'];
    if (day && month && year) {
      submissionDetails.supplyContractConversionDate = `${day}/${month}/${year}`;
    }

    const { sanitizedValue } = sanitizeCurrency(submissionDetails.supplyContractValue);
    if (sanitizedValue) {
      submissionDetails.supplyContractValue = sanitizedValue;
    }

    submissionDetails = await checkAllCountryCodes(deal, submissionDetails);

    if (submissionDetails.supplyContractCurrency) {
      submissionDetails.supplyContractCurrency = await checkCurrency(
        deal.supplyContractCurrency,
        submissionDetails.supplyContractCurrency,
      );
    }

    const dealAfterAllUpdates = await updateSubmissionDetails(req.params.id, submissionDetails, req.params.user);

    const validationErrors = validateSubmissionDetails({ ...dealAfterAllUpdates.submissionDetails, ...req.body });

    const response = {
      validationErrors,
      data: dealAfterAllUpdates.submissionDetails,
    };

    return res.status(200).json(response);
  });
};
