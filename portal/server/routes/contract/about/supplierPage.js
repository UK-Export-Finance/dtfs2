import express from 'express';
import api from '../../../api';
import {
  requestParams,
  mapCountries,
  mapIndustrySectors,
  mapIndustryClasses,
  errorHref,
  generateErrorSummary,
} from '../../../helpers';

import {
  provide, DEAL, INDUSTRY_SECTORS, COUNTRIES,
} from '../../api-data-provider';

import calculateStatusOfEachPage from './navStatusCalculations';
import updateSubmissionDetails from './updateSubmissionDetails';

const router = express.Router();

router.get('/contract/:_id/about/supplier', provide([DEAL, INDUSTRY_SECTORS, COUNTRIES]), async (req, res) => {
  const { deal, industrySectors, countries } = req.apiData;
  const { _id, userToken } = requestParams(req);

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

  const mappedIndustrySectors = mapIndustrySectors(industrySectors, deal.submissionDetails['industry-sector']);
  const mappedIndustryClasses = mapIndustryClasses(industrySectors, deal.submissionDetails['industry-sector'], deal.submissionDetails['industry-class']);
  const mappedCountries = {
    'supplier-address-country': mapCountries(countries, deal.submissionDetails['supplier-address-country']),
    'supplier-correspondence-address-country': mapCountries(countries, deal.submissionDetails['supplier-correspondence-address-country']),
    'indemnifier-address-country': mapCountries(countries, deal.submissionDetails['indemnifier-address-country']),
    'indemnifier-correspondence-address-country': mapCountries(countries, deal.submissionDetails['indemnifier-correspondence-address-country']),
  };

  return res.render('contract/about/about-supplier.njk', {
    deal,
    validationErrors: formattedValidationErrors,
    mappedCountries,
    industrySectors,
    mappedIndustrySectors,
    mappedIndustryClasses,
  });
});

router.post('/contract/:_id/about/supplier', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}/about/buyer`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/supplier/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

export default router;
