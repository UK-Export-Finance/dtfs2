import express from 'express';
import api from '../../api';
import companiesHouseAPI from '../../companies-house-api';
import {
  requestParams,
  mapCountries,
  mapCurrencies,
  mapIndustrySectors,
  mapIndustryClasses,
  errorHref,
  generateErrorSummary,
} from '../../helpers';

import {
  provide, DEAL, INDUSTRY_SECTORS, COUNTRIES, CURRENCIES,
} from '../api-data-provider';

// https://developer.companieshouse.gov.uk/api/docs/company/company_number/registered-office-address/registeredOfficeAddress-resource.html
// England, Wales, Scotland, Northern Ireland, Great Britain, United Kingdom, Not specified
const countriesThatWeConsiderGBR = ['England', 'Wales', 'Scotland', 'Northern Ireland', 'Great Britain', 'United Kingdom'];
const getPortalCountryForCompaniesHouseCountry = (companiesHouseCountry) => {
  if (countriesThatWeConsiderGBR.includes(companiesHouseCountry)) {
    return 'GBR';
  }
  return '';
};

const updateSubmissionDetails = async (deal, postedSubmissionDetails, userToken) => {
  const submissionDetails = { ...postedSubmissionDetails };

  // fix currency
  if (submissionDetails.supplyContractCurrency && !submissionDetails.supplyContractCurrency.id) {
    submissionDetails.supplyContractCurrency = {
      id: submissionDetails.supplyContractCurrency,
    };
  } else {
    submissionDetails.supplyContractCurrency = {
      id: '',
    };
  }

  await api.updateSubmissionDetails(deal, submissionDetails, userToken);
};

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

router.post('/contract/:_id/about/supplier', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}/about/buyer`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/supplier/companies-house-search/:prefix', provide([DEAL, INDUSTRY_SECTORS, COUNTRIES]), async (req, res) => {
  const { prefix } = req.params;
  const { deal, industrySectors, countries } = req.apiData;

  const searchTerm = `${prefix}-companies-house-registration-number`;
  const company = await companiesHouseAPI.searchByRegistrationNumber(req.body[searchTerm]);

  deal.submissionDetails = req.body;

  if (!company) {
    // TODO - send a real message?
    const validation = {};
    validation[`${prefix}-companies-house-registration-number`] = 'not found';

    const mappedIndustrySectors = mapIndustrySectors(industrySectors, deal.submissionDetails['industry-sector']);
    const mappedIndustryClasses = mapIndustryClasses(industrySectors, deal.submissionDetails['industry-sector'], deal.submissionDetails['industry-class']);
    const mappedCountries = {
      'supplier-address-country': mapCountries(countries, deal.submissionDetails['supplier-address-country']),
      'supplier-correspondence-address-country': mapCountries(countries, deal.submissionDetails['supplier-correspondence-address-country']),
      'indemnifier-address-country': mapCountries(countries, deal.submissionDetails['indemnifier-address-country']),
      'indemnifier-correspondence-address-country': mapCountries(countries, deal.submissionDetails['indemnifier-correspondence-address-country']),
    };

    return res.render('contract/about/about-supplier.njk', {
      validation,
      deal,
      mappedCountries,
      industrySectors,
      mappedIndustrySectors,
      mappedIndustryClasses,
    });
  }

  // munge data back into form data
  deal.submissionDetails[`${prefix}-name`] = company.title;
  deal.submissionDetails[`${prefix}-address-line-1`] = company.address.premises;
  deal.submissionDetails[`${prefix}-address-line-2`] = company.address.address_line_1;
  deal.submissionDetails[`${prefix}-address-town`] = company.address.locality;
  deal.submissionDetails[`${prefix}-address-postcode`] = company.address.postal_code;
  deal.submissionDetails[`${prefix}-address-country`] = getPortalCountryForCompaniesHouseCountry(company.address.country);

  // re-render
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
    mappedCountries,
    industrySectors,
    mappedIndustrySectors,
    mappedIndustryClasses,
  });
});

router.post('/contract/:_id/about/supplier/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/buyer', provide([DEAL, COUNTRIES]), async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const { deal, countries } = req.apiData;

  let formattedValidationErrors = {};
  if (deal.submissionDetails.hasBeenPreviewed) {
    const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
    formattedValidationErrors = generateErrorSummary(
      validationErrors,
      errorHref,
    );
  }

  const mappedCountries = {
    'buyer-address-country': mapCountries(countries, deal.submissionDetails['buyer-address-country']),
    destinationOfGoodsAndServices: mapCountries(countries, deal.submissionDetails.destinationOfGoodsAndServices),
  };

  return res.render('contract/about/about-supply-buyer.njk', {
    deal,
    validationErrors: formattedValidationErrors,
    mappedCountries,
  });
});

router.post('/contract/:_id/about/buyer', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}/about/financial`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/buyer/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/financial', provide([DEAL, CURRENCIES]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { deal, currencies } = req.apiData;

  let formattedValidationErrors = {};
  if (deal.submissionDetails.hasBeenPreviewed) {
    const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
    formattedValidationErrors = generateErrorSummary(
      validationErrors,
      errorHref,
    );
  }

  res.render('contract/about/about-supply-financial.njk', {
    deal,
    validationErrors: formattedValidationErrors,
    currencies: mapCurrencies(currencies, deal.submissionDetails.supplyContractCurrency),
  });
});

router.post('/contract/:_id/about/financial', provide([DEAL]), async (req, res) => {
  const { userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${req.params._id}/about/preview`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/financial/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/preview', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const deal = req.apiData[DEAL];

  // TODO dirty hack; this is how we apply the business rule
  //  "don't display error messages unless the user has viewed the preview page"
  await api.updateSubmissionDetails(deal, { hasBeenPreviewed: true }, userToken);

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const formattedValidationErrors = generateErrorSummary(
    validationErrors,
    errorHref,
  );

  return res.render('contract/about/about-supply-preview.njk', { deal, validationErrors: formattedValidationErrors });
});


export default router;
