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
import formDataMatchesOriginalData from '../formDataMatchesOriginalData';

const router = express.Router();

const userCanAccessAbout = (user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  return true;
};

router.get('/contract/:_id/about/supplier', provide([DEAL, INDUSTRY_SECTORS, COUNTRIES]), async (req, res) => {
  const { industrySectors, countries } = req.apiData;
  let { deal } = req.apiData;

  const { _id, userToken } = requestParams(req);

  const { user } = req.session;

  if (!userCanAccessAbout(user)) {
    return res.redirect('/');
  }

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

  // if data was submitted via companies house POST, it's not posted to API and we redirect to this route.
  // if we have this data in the session, combine with existing deal data to be rendered in the page.
  if (req.session.aboutSupplierFormData) {
    deal = {
      ...deal,
      ...req.session.aboutSupplierFormData,
    };
    req.session.aboutSupplierFormData = null;
  }

  const mappedIndustrySectors = mapIndustrySectors(industrySectors, deal.submissionDetails['industry-sector']);
  const mappedIndustryClasses = mapIndustryClasses(industrySectors, deal.submissionDetails['industry-sector'], deal.submissionDetails['industry-class']);

  const supplierAddressCountryCode = deal.submissionDetails['supplier-address-country'] && deal.submissionDetails['supplier-address-country'].code;
  const supplierCorrespondenceAddressCountryCode = deal.submissionDetails['supplier-correspondence-address-country'] && deal.submissionDetails['supplier-correspondence-address-country'].code;
  const indemnifierAddressCountryCode = deal.submissionDetails['indemnifier-address-country'] && deal.submissionDetails['indemnifier-address-country'].code;
  const indemnifierCorrespondenceAddressCountryCode = deal.submissionDetails['indemnifier-correspondence-address-country'] && deal.submissionDetails['indemnifier-correspondence-address-country'].code;

  const mappedCountries = {
    'supplier-address-country': mapCountries(countries, supplierAddressCountryCode),
    'supplier-correspondence-address-country': mapCountries(countries, supplierCorrespondenceAddressCountryCode),
    'indemnifier-address-country': mapCountries(countries, indemnifierAddressCountryCode),
    'indemnifier-correspondence-address-country': mapCountries(countries, indemnifierCorrespondenceAddressCountryCode),
  };

  return res.render('contract/about/about-supplier.njk', {
    deal,
    validationErrors: formattedValidationErrors,
    mappedCountries,
    industrySectors,
    mappedIndustrySectors,
    mappedIndustryClasses,
    user: req.session.user,
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
  const deal = req.apiData[DEAL];

  const {
    'supplier-address-country': supplierAddressCountry,
    'supplier-correspondence-address-country': supplierCorrespondenceAddressCountry,
    'indemnifier-address-country': indemnifierAddressCountry,
    'indemnifier-correspondence-address-country': indemnifierCorrespondenceAddressCountry,
  } = deal.submissionDetails;

  // UI form submit only has the country code. API has a country object.
  // to check if something has changed, only use the country code.
  const mappedOriginalData = {
    ...deal.submissionDetails,
    'supplier-address-country': (supplierAddressCountry && supplierAddressCountry.code) ? supplierAddressCountry.code : '',
    'supplier-correspondence-address-country': (supplierCorrespondenceAddressCountry && supplierCorrespondenceAddressCountry.code) ? supplierCorrespondenceAddressCountry.code : '',
    'indemnifier-address-country': (indemnifierAddressCountry && indemnifierAddressCountry.code) ? indemnifierAddressCountry.code : '',
    'indemnifier-correspondence-address-country': (indemnifierCorrespondenceAddressCountry && indemnifierCorrespondenceAddressCountry.code) ? indemnifierCorrespondenceAddressCountry.code : '',
  };

  if (!formDataMatchesOriginalData(req.body, mappedOriginalData)) {
    await updateSubmissionDetails(deal, req.body, userToken);
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

export default router;
