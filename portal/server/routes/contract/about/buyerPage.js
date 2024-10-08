const express = require('express');
const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { requestParams, mapCountries, errorHref, generateErrorSummary, constructPayload } = require('../../../helpers');

const { provide, DEAL, COUNTRIES } = require('../../api-data-provider');

const updateSubmissionDetails = require('./updateSubmissionDetails');
const aboutTaskList = require('./aboutTaskList');
const calculateStatusOfEachPage = require('./navStatusCalculations');
const { buyerValidationErrors } = require('./pageSpecificValidationErrors');
const { formDataMatchesOriginalData } = require('../formDataMatchesOriginalData');
const { validateRole } = require('../../middleware');

const router = express.Router();

router.get('/contract/:_id/about/buyer', [validateRole({ role: [MAKER] }), provide([DEAL, COUNTRIES])], async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const { deal, countries } = req.apiData;

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const errorSummary = generateErrorSummary(validationErrors, errorHref);

  const completedForms = calculateStatusOfEachPage(Object.keys(errorSummary.errorList));

  const buyerAddressCountryCode = deal.submissionDetails['buyer-address-country'] && deal.submissionDetails['buyer-address-country'].code;
  const destinationOfGoodsAndServicesCountryCode =
    deal.submissionDetails.destinationOfGoodsAndServices && deal.submissionDetails.destinationOfGoodsAndServices.code;

  const mappedCountries = {
    'buyer-address-country': mapCountries(countries, buyerAddressCountryCode),
    destinationOfGoodsAndServices: mapCountries(countries, destinationOfGoodsAndServicesCountryCode),
  };

  return res.render('contract/about/about-supply-buyer.njk', {
    deal,
    validationErrors: buyerValidationErrors(validationErrors, deal.submissionDetails),
    mappedCountries,
    user: req.session.user,
    taskListItems: aboutTaskList(completedForms),
  });
});
const buyerSubmissionDetailsProperties = [
  'buyer-name',
  'buyer-address-country',
  'buyer-address-line-1',
  'buyer-address-line-2',
  'buyer-address-line-3',
  'buyer-address-town',
  'buyer-address-postcode',
  'destinationOfGoodsAndServices',
];

router.post('/contract/:_id/about/buyer', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const submissionDetailsPayload = constructPayload(req.body, buyerSubmissionDetailsProperties, true);

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetailsPayload, userToken);

  const redirectUrl = `/contract/${_id}/about/financial`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/buyer/save-go-back', provide([DEAL]), async (req, res) => {
  const deal = req.apiData[DEAL];
  const { _id, userToken } = requestParams(req);

  const { 'buyer-address-country': buyerAddressCountry, destinationOfGoodsAndServices } = deal.submissionDetails;

  // UI form submit only has the country code. API has a country object.
  // to check if something has changed, only use the country code.
  const destinationOfGoodsAndServicesCode = destinationOfGoodsAndServices && destinationOfGoodsAndServices.code ? destinationOfGoodsAndServices.code : '';

  const mappedOriginalData = {
    ...deal.submissionDetails,
    'buyer-address-country': buyerAddressCountry && buyerAddressCountry.code ? buyerAddressCountry.code : '',
    destinationOfGoodsAndServices: destinationOfGoodsAndServicesCode,
  };

  const submissionDetailsPayload = constructPayload(req.body, buyerSubmissionDetailsProperties, true);

  if (!formDataMatchesOriginalData(submissionDetailsPayload, mappedOriginalData)) {
    await updateSubmissionDetails(deal, submissionDetailsPayload, userToken);
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

module.exports = router;
