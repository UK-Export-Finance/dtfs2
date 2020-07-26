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

import calculateStatusOfEachPage from './navStatusCalculations';
import updateSubmissionDetails from './updateSubmissionDetails';
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

  let formattedValidationErrors = {};
  if (deal.submissionDetails.hasBeenPreviewed) {
    const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
    formattedValidationErrors = generateErrorSummary(
      validationErrors,
      errorHref,
    );

    deal.supplyContract = {
      completedStatus: calculateStatusOfEachPage(Object.keys(formattedValidationErrors.errorList)),
    };
  }

  const buyerAddressCountryCode = deal.submissionDetails['buyer-address-country'] && deal.submissionDetails['buyer-address-country'].code;
  const destinationOfGoodsAndServicesCountryCode = deal.submissionDetails.destinationOfGoodsAndServices
                                                   && deal.submissionDetails.destinationOfGoodsAndServices.code;

  const mappedCountries = {
    'buyer-address-country': mapCountries(countries, buyerAddressCountryCode),
    destinationOfGoodsAndServices: mapCountries(countries, destinationOfGoodsAndServicesCountryCode),
  };

  return res.render('contract/about/about-supply-buyer.njk', {
    deal,
    validationErrors: formattedValidationErrors,
    mappedCountries,
    user: req.session.user,
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
  const submissionDetails = req.body;

  const mappedSubmissionDetailsForMatchCheck = {
    ...deal.submissionDetails,
    'buyer-address-country': deal.submissionDetails['buyer-address-country'].code,
    destinationOfGoodsAndServices: deal.submissionDetails.destinationOfGoodsAndServices.code,
  };

  if (!formDataMatchesOriginalData(submissionDetails, mappedSubmissionDetailsForMatchCheck)) {
    console.log('***** submission details - buyer CHANGED, posting to api');
    await updateSubmissionDetails(deal, submissionDetails, userToken);
  } else {
    console.log('***** submission details - buyer not changed.');
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

export default router;
