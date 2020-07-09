const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const db = require('../../drivers/db-client');
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

const updateSubmissionDetails = async (collection, _id, submissionDetails) => {
  const update = {
    submissionDetails,
    details: {
      dateOfLastAction: now(),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
    $.flatten(update),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};


const countryObject = async (countryCode) => {
  const countryObj = await findOneCountry(countryCode);

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
  return existingCountryCode;
};

const checkAllCountryCodes = async (deal, fields) => {
  const modifiedFields = fields;

  if (modifiedFields.destinationOfGoodsAndServices) {
    modifiedFields.destinationOfGoodsAndServices = await checkCountryCode(deal, fields, 'destinationOfGoodsAndServices');
  }

  if (modifiedFields['buyer-address-country']) {
    modifiedFields['buyer-address-country'] = await checkCountryCode(deal, fields, 'buyer-address-country');
  }

  if (modifiedFields['indemnifier-correspondence-address-country']) {
    modifiedFields['indemnifier-correspondence-address-country'] = await checkCountryCode(deal, fields, 'indemnifier-correspondence-address-country');
  }

  if (modifiedFields['indemnifier-address-country']) {
    modifiedFields['indemnifier-address-country'] = await checkCountryCode(deal, fields, 'indemnifier-address-country');
  }

  if (modifiedFields['supplier-address-country']) {
    modifiedFields['supplier-address-country'] = await checkCountryCode(deal, fields, 'supplier-address-country');
  }

  if (modifiedFields['supplier-correspondence-address-country']) {
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

    const validationErrors = validateSubmissionDetails({ ...deal.submissionDetails, ...req.body });

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

    const collection = await db.getCollection('deals');
    const dealAfterAllUpdates = await updateSubmissionDetails(collection, req.params.id, submissionDetails);

    const response = {
      validationErrors,
      data: dealAfterAllUpdates.submissionDetails,
    };

    return res.status(200).json(response);
  });
};
