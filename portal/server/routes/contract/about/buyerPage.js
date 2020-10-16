import express from 'express';
import api from '../../../api';
import {
  requestParams,
  mapCountries,
  errorHref,
  generateErrorSummary,
} from '../../../helpers';

import {
  provide, DEAL, COUNTRIES,
} from '../../api-data-provider';

import updateSubmissionDetails from './updateSubmissionDetails';
import aboutTaskList from './aboutTaskList';
import calculateStatusOfEachPage from './navStatusCalculations';
import { buyerValidationErrors } from './pageSpecificValidationErrors';
import formDataMatchesOriginalData from '../formDataMatchesOriginalData';

const router = express.Router();

const userCanAccessAbout = (user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  return true;
};

router.get('/contract/:_id/about/buyer', provide([DEAL, COUNTRIES]), async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const { user } = req.session;
  if (!userCanAccessAbout(user)) {
    return res.redirect('/');
  }

  const { deal, countries } = req.apiData;

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const errorSummary = generateErrorSummary(
    validationErrors,
    errorHref,
  );

  const completedForms = calculateStatusOfEachPage(Object.keys(errorSummary.errorList));

  const buyerAddressCountryCode = deal.submissionDetails['buyer-address-country'] && deal.submissionDetails['buyer-address-country'].code;
  const destinationOfGoodsAndServicesCountryCode = deal.submissionDetails.destinationOfGoodsAndServices
                                                   && deal.submissionDetails.destinationOfGoodsAndServices.code;

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

router.post('/contract/:_id/about/buyer', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}/about/financial`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/buyer/save-go-back', provide([DEAL]), async (req, res) => {
  const deal = req.apiData[DEAL];
  const { _id, userToken } = requestParams(req);

  const {
    'buyer-address-country': buyerAddressCountry,
    destinationOfGoodsAndServices,
  } = deal.submissionDetails;

  // UI form submit only has the country code. API has a country object.
  // to check if something has changed, only use the country code.
  const destinationOfGoodsAndServicesCode = (destinationOfGoodsAndServices && destinationOfGoodsAndServices.code) ? destinationOfGoodsAndServices.code : '';

  const mappedOriginalData = {
    ...deal.submissionDetails,
    'buyer-address-country': (buyerAddressCountry && buyerAddressCountry.code) ? buyerAddressCountry.code : '',
    destinationOfGoodsAndServices: destinationOfGoodsAndServicesCode,
  };

  if (!formDataMatchesOriginalData(req.body, mappedOriginalData)) {
    await updateSubmissionDetails(deal, req.body, userToken);
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

export default router;
