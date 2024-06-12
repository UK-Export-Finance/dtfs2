const express = require('express');
const {
  ROLES: { MAKER },
  isValidCompanyRegistrationNumber,
} = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { requestParams, mapCountries, mapIndustrySectors, mapIndustryClasses, errorHref, generateErrorSummary, constructPayload } = require('../../../helpers');
const { provide, DEAL, INDUSTRY_SECTORS, COUNTRIES } = require('../../api-data-provider');
const updateSubmissionDetails = require('./updateSubmissionDetails');
const calculateStatusOfEachPage = require('./navStatusCalculations');
const aboutTaskList = require('./aboutTaskList');
const { supplierValidationErrors } = require('./pageSpecificValidationErrors');
const { formDataMatchesOriginalData } = require('../formDataMatchesOriginalData');
const industryFields = require('./industryFields');
const { validateRole } = require('../../middleware');

const router = express.Router();

router.get('/contract/:_id/about/supplier', [validateRole({ role: [MAKER] }), provide([DEAL, INDUSTRY_SECTORS, COUNTRIES])], async (req, res) => {
  const { industrySectors, countries } = req.apiData;
  let { deal } = req.apiData;

  const { _id, userToken } = requestParams(req);
  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  // if companies house submit button was pressed and there are validation errors,
  // combine with existing deal validation errors.
  if (req.session.companiesHouseSearchValidationErrors) {
    validationErrors.count += req.session.companiesHouseSearchValidationErrors.count;
    validationErrors.errorList = {
      ...validationErrors.errorList,
      ...req.session.companiesHouseSearchValidationErrors.errorList,
    };
    delete req.session.companiesHouseSearchValidationErrors;
  }

  const errorSummary = generateErrorSummary(validationErrors, errorHref);

  const completedForms = calculateStatusOfEachPage(Object.keys(errorSummary.errorList));

  // if data was submitted via companies house POST, it's not posted to API and we redirect to this route.
  // if we have this data in the session, combine with existing deal data to be rendered in the page.
  if (req.session.aboutSupplierFormData) {
    deal = {
      ...deal,
      ...req.session.aboutSupplierFormData,
    };
    req.session.aboutSupplierFormData = null;
  }
  if (deal.submissionDetails['supplier-companies-house-registration-number']) {
    if (!isValidCompanyRegistrationNumber(deal.submissionDetails['supplier-companies-house-registration-number'])) {
      validationErrors.count += 1;
      validationErrors.errorList = {
        ...validationErrors.errorList,
        'supplier-companies-house-registration-number': {
          order: '1',
          text: 'Enter a valid Companies House registration number',
        },
      };
    }
  }
  const mappedIndustrySectors = mapIndustrySectors(industrySectors, deal.submissionDetails['industry-sector']);
  const mappedIndustryClasses = mapIndustryClasses(industrySectors, deal.submissionDetails['industry-sector'], deal.submissionDetails['industry-class']);

  const supplierAddressCountryCode = deal.submissionDetails['supplier-address-country'] && deal.submissionDetails['supplier-address-country'].code;
  const supplierCorrespondenceAddressCountryCode =
    deal.submissionDetails['supplier-correspondence-address-country'] && deal.submissionDetails['supplier-correspondence-address-country'].code;
  const indemnifierAddressCountryCode = deal.submissionDetails['indemnifier-address-country'] && deal.submissionDetails['indemnifier-address-country'].code;
  const indemnifierCorrespondenceAddressCountryCode =
    deal.submissionDetails['indemnifier-correspondence-address-country'] && deal.submissionDetails['indemnifier-correspondence-address-country'].code;

  const mappedCountries = {
    'supplier-address-country': mapCountries(countries, supplierAddressCountryCode),
    'supplier-correspondence-address-country': mapCountries(countries, supplierCorrespondenceAddressCountryCode),
    'indemnifier-address-country': mapCountries(countries, indemnifierAddressCountryCode),
    'indemnifier-correspondence-address-country': mapCountries(countries, indemnifierCorrespondenceAddressCountryCode),
  };
  return res.render('contract/about/about-supplier.njk', {
    deal,
    validationErrors: supplierValidationErrors(validationErrors, deal.submissionDetails),
    mappedCountries,
    industrySectors,
    mappedIndustrySectors,
    mappedIndustryClasses,
    user: req.session.user,
    taskListItems: aboutTaskList(completedForms),
  });
});

const supplierSubmissionDetailsFields = [
  'supplier-type',
  'supplier-companies-house-registration-number',
  'supplier-name',
  'supplier-address-country',
  'supplier-address-line-1',
  'supplier-address-line-2',
  'supplier-address-line-3',
  'supplier-address-town',
  'supplier-address-postcode',
  'supplier-correspondence-address-is-different',
  'supplier-correspondence-address-country',
  'supplier-correspondence-address-line-1',
  'supplier-correspondence-address-line-2',
  'supplier-correspondence-address-line-3',
  'supplier-correspondence-address-town',
  'supplier-correspondence-address-postcode',
  'industry-sector',
  'industry-class',
  'sme-type',
  'supply-contract-description',
  'legallyDistinct',
  'indemnifier-companies-house-registration-number',
  'indemnifier-name',
  'indemnifier-address-country',
  'indemnifier-address-line-1',
  'indemnifier-address-line-2',
  'indemnifier-address-line-3',
  'indemnifier-address-town',
  'indemnifier-address-postcode',
  'indemnifierCorrespondenceAddressDifferent',
  'indemnifier-correspondence-address-country',
  'indemnifier-correspondence-address-line-1',
  'indemnifier-correspondence-address-line-2',
  'indemnifier-correspondence-address-line-3',
  'indemnifier-correspondence-address-town',
  'indemnifier-correspondence-address-postcode',
];

router.post('/contract/:_id/about/supplier', provide([INDUSTRY_SECTORS]), async (req, res) => {
  const { industrySectors } = req.apiData;
  const { _id, userToken } = requestParams(req);
  let submissionDetails = constructPayload(req.body, supplierSubmissionDetailsFields, true);

  if (submissionDetails['supplier-correspondence-address-is-different'] === 'false') {
    // clear supplier correspondence address fields:
    submissionDetails['supplier-correspondence-address-country'] = '';
    submissionDetails['supplier-correspondence-address-line-1'] = '';
    submissionDetails['supplier-correspondence-address-line-2'] = '';
    submissionDetails['supplier-correspondence-address-line-3'] = '';
    submissionDetails['supplier-correspondence-address-town'] = '';
    submissionDetails['supplier-correspondence-address-postcode'] = '';
  }

  if (submissionDetails.legallyDistinct === 'false') {
    // clear indemnifier fields:
    submissionDetails['indemnifier-companies-house-registration-number'] = '';
    submissionDetails['indemnifier-name'] = '';
    submissionDetails['indemnifier-address-country'] = '';
    submissionDetails['indemnifier-address-line-1'] = '';
    submissionDetails['indemnifier-address-line-2'] = '';
    submissionDetails['indemnifier-address-line-3'] = '';
    submissionDetails['indemnifier-address-town'] = '';
    submissionDetails['indemnifier-address-postcode'] = '';
    submissionDetails.indemnifierCorrespondenceAddressDifferent = '';
    submissionDetails['indemnifier-correspondence-address-country'] = '';
    submissionDetails['indemnifier-correspondence-address-line-1'] = '';
    submissionDetails['indemnifier-correspondence-address-line-2'] = '';
    submissionDetails['indemnifier-correspondence-address-line-3'] = '';
    submissionDetails['indemnifier-correspondence-address-town'] = '';
    submissionDetails['indemnifier-correspondence-address-postcode'] = '';
  }

  if (submissionDetails.indemnifierCorrespondenceAddressDifferent === 'false') {
    // clear indemnifier correspondence address fields:
    submissionDetails['indemnifier-correspondence-address-country'] = '';
    submissionDetails['indemnifier-correspondence-address-line-1'] = '';
    submissionDetails['indemnifier-correspondence-address-line-2'] = '';
    submissionDetails['indemnifier-correspondence-address-line-3'] = '';
    submissionDetails['indemnifier-correspondence-address-town'] = '';
    submissionDetails['indemnifier-correspondence-address-postcode'] = '';
  }

  submissionDetails = industryFields(submissionDetails, industrySectors);

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}/about/buyer`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/supplier/save-go-back', provide([DEAL, INDUSTRY_SECTORS]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const deal = req.apiData[DEAL];
  const { industrySectors } = req.apiData;

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
    'supplier-address-country': supplierAddressCountry && supplierAddressCountry.code ? supplierAddressCountry.code : '',
    'supplier-correspondence-address-country':
      supplierCorrespondenceAddressCountry && supplierCorrespondenceAddressCountry.code ? supplierCorrespondenceAddressCountry.code : '',
    'indemnifier-address-country': indemnifierAddressCountry && indemnifierAddressCountry.code ? indemnifierAddressCountry.code : '',
    'indemnifier-correspondence-address-country':
      indemnifierCorrespondenceAddressCountry && indemnifierCorrespondenceAddressCountry.code ? indemnifierCorrespondenceAddressCountry.code : '',
  };

  let submissionDetails = constructPayload(req.body, supplierSubmissionDetailsFields, true);

  if (submissionDetails['supplier-correspondence-address-is-different'] === 'false') {
    // clear supplier correspondence address fields:
    submissionDetails['supplier-correspondence-address-country'] = '';
    submissionDetails['supplier-correspondence-address-line-1'] = '';
    submissionDetails['supplier-correspondence-address-line-2'] = '';
    submissionDetails['supplier-correspondence-address-line-3'] = '';
    submissionDetails['supplier-correspondence-address-town'] = '';
    submissionDetails['supplier-correspondence-address-postcode'] = '';
  }

  if (submissionDetails.legallyDistinct === 'false') {
    // clear indemnifier fields:
    submissionDetails['indemnifier-companies-house-registration-number'] = '';
    submissionDetails['indemnifier-name'] = '';
    submissionDetails['indemnifier-address-country'] = '';
    submissionDetails['indemnifier-address-line-1'] = '';
    submissionDetails['indemnifier-address-line-2'] = '';
    submissionDetails['indemnifier-address-line-3'] = '';
    submissionDetails['indemnifier-address-town'] = '';
    submissionDetails['indemnifier-address-postcode'] = '';
    submissionDetails.indemnifierCorrespondenceAddressDifferent = '';
    submissionDetails['indemnifier-correspondence-address-country'] = '';
    submissionDetails['indemnifier-correspondence-address-line-1'] = '';
    submissionDetails['indemnifier-correspondence-address-line-2'] = '';
    submissionDetails['indemnifier-correspondence-address-line-3'] = '';
    submissionDetails['indemnifier-correspondence-address-town'] = '';
    submissionDetails['indemnifier-correspondence-address-postcode'] = '';
  }

  if (submissionDetails.indemnifierCorrespondenceAddressDifferent === 'false') {
    // clear indemnifier correspondence address fields:
    submissionDetails['indemnifier-correspondence-address-country'] = '';
    submissionDetails['indemnifier-correspondence-address-line-1'] = '';
    submissionDetails['indemnifier-correspondence-address-line-2'] = '';
    submissionDetails['indemnifier-correspondence-address-line-3'] = '';
    submissionDetails['indemnifier-correspondence-address-town'] = '';
    submissionDetails['indemnifier-correspondence-address-postcode'] = '';
  }

  submissionDetails = industryFields(submissionDetails, industrySectors);
  if (!formDataMatchesOriginalData(submissionDetails, mappedOriginalData)) {
    await updateSubmissionDetails(deal, submissionDetails, userToken);
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

module.exports = router;
