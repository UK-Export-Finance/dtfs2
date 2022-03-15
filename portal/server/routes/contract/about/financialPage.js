const express = require('express');
const api = require('../../../api');
const {
  requestParams,
  mapCurrencies,
  errorHref,
  generateErrorSummary,
  sanitizeCurrency,
} = require('../../../helpers');

const {
  provide, DEAL, CURRENCIES,
} = require('../../api-data-provider');

const updateSubmissionDetails = require('./updateSubmissionDetails');
const calculateStatusOfEachPage = require('./navStatusCalculations');
const aboutTaskList = require('./aboutTaskList');
const { financialPageValidationErrors } = require('./pageSpecificValidationErrors');
const { formDataMatchesOriginalData } = require('../formDataMatchesOriginalData');

const router = express.Router();

const userCanAccessAbout = (user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  return true;
};

router.get('/contract/:_id/about/financial', provide([CURRENCIES]), async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const { user } = req.session;
  if (!userCanAccessAbout(user)) {
    return res.redirect('/');
  }

  const { deal, currencies } = req.apiData;

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const errorSummary = generateErrorSummary(
    validationErrors,
    errorHref,
  );

  const completedForms = calculateStatusOfEachPage(Object.keys(errorSummary.errorList));

  return res.render('contract/about/about-supply-financial.njk', {
    deal,
    validationErrors: financialPageValidationErrors(validationErrors, deal.submissionDetails),
    currencies: mapCurrencies(currencies, deal.submissionDetails.supplyContractCurrency),
    user: req.session.user,
    taskListItems: aboutTaskList(completedForms),
  });
});

router.post('/contract/:_id/about/financial', provide([DEAL]), async (req, res) => {
  const { userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${req.params._id}/about/check-your-answers`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/financial/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const deal = req.apiData[DEAL];
  const submissionDetails = req.body;

  const mappedFormDataForMatchCheck = {
    ...submissionDetails,
    supplyContractValue: sanitizeCurrency(submissionDetails.supplyContractValue).sanitizedValue,
  };

  const { supplyContractCurrency } = deal.submissionDetails;

  // UI form submit only has the currency code. API has a currency object.
  // to check if something has changed, only use the currency code.
  const mappedOriginalData = {
    ...deal.submissionDetails,
    supplyContractCurrency: (supplyContractCurrency && supplyContractCurrency.id) ? supplyContractCurrency.id : '',
  };

  if (!formDataMatchesOriginalData(mappedFormDataForMatchCheck, mappedOriginalData)) {
    await updateSubmissionDetails(deal, submissionDetails, userToken);
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

module.exports = router;
