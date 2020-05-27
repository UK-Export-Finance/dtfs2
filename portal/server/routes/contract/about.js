import express from 'express';
import api from '../../api';
import companiesHouseAPI from '../../companies-house-api';
import {
  getApiData,
  requestParams,
  mapCountries,
  mapCurrencies,
  mapIndustrySectors,
  mapIndustryClasses,
  errorHref,
  generateErrorSummary,
} from '../../helpers';

// https://developer.companieshouse.gov.uk/api/docs/company/company_number/registered-office-address/registeredOfficeAddress-resource.html
// England, Wales, Scotland, Northern Ireland, Great Britain, United Kingdom, Not specified
const countriesThatWeConsiderGBR = ['England', 'Wales', 'Scotland', 'Northern Ireland', 'Great Britain', 'United Kingdom'];
const getPortalCountryForCompaniesHouseCountry = (companiesHouseCountry) => {
  if (countriesThatWeConsiderGBR.includes(companiesHouseCountry)) {
    return 'GBR';
  }
  return '';
};

const updateSubmissionDetails = async (dealId, postedSubmissionDetails, userToken, res) => {
  const deal = await getApiData(
    api.contract(dealId, userToken),
    res,
  );

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

  await api.updateSubmissionDetails(deal, submissionDetails, userToken, res);
};

const router = express.Router();

router.get('/contract/:_id/about/supplier', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  let formattedValidationErrors = {};
  if (deal.submissionDetails.hasBeenPreviewed) {
    const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
    formattedValidationErrors = generateErrorSummary(
      validationErrors,
      errorHref,
    );
  }

  const industrySectors = await getApiData(
    api.industrySectors(userToken),
    res,
  );
  const countries = await getApiData(
    api.countries(userToken),
    res,
  );

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

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}/about/buyer`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/supplier/companies-house-search/:prefix', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { prefix } = req.params;

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  const searchTerm = `${prefix}-companies-house-registration-number`;
  const company = await companiesHouseAPI.searchByRegistrationNumber(req.body[searchTerm]);

  deal.submissionDetails = req.body;

  if (!company) {
    // TODO - send a real message?
    const validation = {};
    validation[`${prefix}-companies-house-registration-number`] = 'not found';

    const industrySectors = await getApiData(
      api.industrySectors(userToken),
      res,
    );
    const countries = await getApiData(
      api.countries(userToken),
      res,
    );

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

  const industrySectors = await getApiData(
    api.industrySectors(userToken),
    res,
  );
  const countries = await getApiData(
    api.countries(userToken),
    res,
  );

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

router.post('/contract/:_id/about/supplier/save-go-back', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/buyer', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  let formattedValidationErrors = {};
  if (deal.submissionDetails.hasBeenPreviewed) {
    const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
    formattedValidationErrors = generateErrorSummary(
      validationErrors,
      errorHref,
    );
  }

  const countries = await getApiData(
    api.countries(userToken),
    res,
  );
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

router.post('/contract/:_id/about/buyer', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}/about/financial`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/buyer/save-go-back', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/financial', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const currencies = await getApiData(
    api.bondCurrencies(userToken),
    res,
  );

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

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

router.post('/contract/:_id/about/financial', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${req.params._id}/about/preview`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/financial/save-go-back', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/preview', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  // TODO dirty hack; this is how we apply the business rule
  //  "don't display error messages unless the user has viewed the preview page"
  await api.updateSubmissionDetails(deal, { hasBeenPreviewed: true }, userToken, res);

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const formattedValidationErrors = generateErrorSummary(
    validationErrors,
    errorHref,
  );

  return res.render('contract/about/about-supply-preview.njk', { deal, validationErrors: formattedValidationErrors });
});


export default router;
