const express = require('express');
const {
  CURRENCY,
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { requestParams, mapCurrencies, errorHref, generateErrorSummary, sanitizeCurrency, constructPayload } = require('../../../helpers');

const { provide, DEAL, CURRENCIES } = require('../../api-data-provider');

const updateSubmissionDetails = require('./updateSubmissionDetails');
const calculateStatusOfEachPage = require('./navStatusCalculations');
const aboutTaskList = require('./aboutTaskList');
const { financialPageValidationErrors } = require('./pageSpecificValidationErrors');
const { formDataMatchesOriginalData } = require('../formDataMatchesOriginalData');
const { validateRole } = require('../../middleware');

const router = express.Router();

router.get('/contract/:_id/about/financial', [validateRole({ role: [MAKER] }), provide([CURRENCIES])], async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const { deal, currencies } = req.apiData;

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const errorSummary = generateErrorSummary(validationErrors, errorHref);

  const completedForms = calculateStatusOfEachPage(Object.keys(errorSummary.errorList));

  return res.render('contract/about/about-supply-financial.njk', {
    deal,
    validationErrors: financialPageValidationErrors(validationErrors, deal.submissionDetails),
    currencies: mapCurrencies(currencies, deal.submissionDetails.supplyContractCurrency),
    user: req.session.user,
    taskListItems: aboutTaskList(completedForms),
  });
});

const financialSubmissionDetailsProperties = [
  'supplyContractValue',
  'supplyContractCurrency',
  'supplyContractConversionRateToGBP',
  'supplyContractConversionDate-day',
  'supplyContractConversionDate-month',
  'supplyContractConversionDate-year',
];

const filterFinancialSubmissionDetailsPayload = (body) => {
  const payload = constructPayload(body, financialSubmissionDetailsProperties, true);

  if (payload.supplyContractCurrency === CURRENCY.GBP) {
    delete payload.supplyContractConversionRateToGBP;
    delete payload['supplyContractConversionDate-day'];
    delete payload['supplyContractConversionDate-month'];
    delete payload['supplyContractConversionDate-year'];
  }

  return payload;
};

router.post('/contract/:_id/about/financial', provide([DEAL]), async (req, res) => {
  const { userToken } = requestParams(req);
  const submissionDetailsPayload = filterFinancialSubmissionDetailsPayload(req.body);

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetailsPayload, userToken);

  const redirectUrl = `/contract/${req.params._id}/about/check-your-answers`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/financial/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const deal = req.apiData[DEAL];
  const submissionDetails = filterFinancialSubmissionDetailsPayload(req.body);

  const mappedFormDataForMatchCheck = {
    ...submissionDetails,
    supplyContractValue: sanitizeCurrency(submissionDetails.supplyContractValue).sanitizedValue,
  };

  const { supplyContractCurrency } = deal.submissionDetails;

  // UI form submit only has the currency code. API has a currency object.
  // to check if something has changed, only use the currency code.
  const mappedOriginalData = {
    ...deal.submissionDetails,
    supplyContractCurrency: supplyContractCurrency && supplyContractCurrency.id ? supplyContractCurrency.id : '',
  };

  if (!formDataMatchesOriginalData(mappedFormDataForMatchCheck, mappedOriginalData)) {
    await updateSubmissionDetails(deal, submissionDetails, userToken);
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

module.exports = router;
