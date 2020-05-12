import express from 'express';
import api from '../../api';
import companiesHouseAPI from '../../companies-house-api';
import {
  getApiData,
  requestParams,
  mapCurrencies,
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


const copyAddressData = (submissionDetails, sourcePrefix, targetPrefix) => {
  const response = { ...submissionDetails };
  response[`${targetPrefix}-line-1`] = submissionDetails[`${sourcePrefix}-line-1`];
  response[`${targetPrefix}-line-2`] = submissionDetails[`${sourcePrefix}-line-2`];
  response[`${targetPrefix}-town`] = submissionDetails[`${sourcePrefix}-town`];
  response[`${targetPrefix}-county`] = submissionDetails[`${sourcePrefix}-county`];
  response[`${targetPrefix}-postcode`] = submissionDetails[`${sourcePrefix}-postcode`];
  response[`${targetPrefix}-country`] = submissionDetails[`${sourcePrefix}-country`];

  return response;
};

const updateSubmissionDetails = async (dealId, postedSubmissionDetails, userToken, res) => {
  const deal = await getApiData(
    api.contract(dealId, userToken),
    res,
  );

  let submissionDetails = { ...postedSubmissionDetails };

  // autopopulation of addresses based on user selection
  if (submissionDetails['supplier-correspondence-address-is-different'] !== 'true') {
    submissionDetails = copyAddressData(submissionDetails, 'supplier-address', 'supplier-correspondence-address');
  }

  if (submissionDetails.legallyDistinct !== 'true') {
    submissionDetails = copyAddressData(submissionDetails, 'supplier-address', 'indemnifier-address');
  }

  if (submissionDetails.indemnifierCorrespondenceAddressDifferent !== 'true') {
    submissionDetails = copyAddressData(submissionDetails, 'indemnifier-address', 'indemnifier-correspondence-address');
  }

  // fix industrySector/industryClass data; is nested in source data, and the way it's rendered makes this preferable
  if (submissionDetails.industrySector && submissionDetails.industryClass) {
    submissionDetails.industrySector = {
      code: submissionDetails.industrySector,
      name: '', // TODO
      class: {
        code: submissionDetails.industryClass,
        name: '', // TODO
      },
    };
    delete submissionDetails.industryClass;
  }

  // fix currency
  if (submissionDetails.supplyContractCurrency && !submissionDetails.supplyContractCurrency.id) {
    submissionDetails.supplyContractCurrency = {
      id: submissionDetails.supplyContractCurrency,
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

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const formattedValidationErrors = generateErrorSummary(
    validationErrors,
    errorHref,
  );

  return res.render('contract/about/about-supplier.njk', {
    deal,
    validationErrors: formattedValidationErrors,
    countries: await getApiData(
      api.countries(userToken),
      res,
    ),
    industrySectors: await getApiData(
      api.industrySectors(userToken),
      res,
    ),
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

  // fix industrySector/industryClass data; is nested in source data, and the way it's rendered makes this preferable
  const submissionDetails = req.body;
  if (submissionDetails.industrySector && submissionDetails.industryClass) {
    submissionDetails.industrySector = {
      code: submissionDetails.industrySector,
      name: '', // TODO
      class: {
        code: submissionDetails.industryClass,
        name: '', // TODO
      },
    };
  }

  // cache the current form status in the deal so it gets re-displayed when we re-render..
  deal.submissionDetails = submissionDetails;

  if (!company) {
    // TODO - send a real message?
    const validation = {};
    validation[`${prefix}-companies-house-registration-number`] = 'not found';

    return res.render('contract/about/about-supplier.njk', {
      validation,
      deal,
      countries: await getApiData(
        api.countries(userToken),
        res,
      ),
      industrySectors: await getApiData(
        api.industrySectors(userToken),
        res,
      ),
    });
  }

  // munge data back into form data
  deal.submissionDetails[`${prefix}-name`] = company.title;
  deal.submissionDetails[`${prefix}-address-line-1`] = company.address.premises;
  deal.submissionDetails[`${prefix}-address-line-2`] = company.address.address_line_1;
  deal.submissionDetails[`${prefix}-address-town`] = company.address.locality;
  deal.submissionDetails[`${prefix}-address-postcode`] = company.address.postal_code;
  deal.submissionDetails[`${prefix}-address-country`] = getPortalCountryForCompaniesHouseCountry(company.address.country);
  // looks like CH don't use this?
  // contract.submissionDetails["supplier-address-county"] = company.address.?????;

  // re-render
  return res.render('contract/about/about-supplier.njk', {
    deal,
    countries: await getApiData(
      api.countries(userToken),
      res,
    ),
    industrySectors: await getApiData(
      api.industrySectors(userToken),
      res,
    ),
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

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const formattedValidationErrors = generateErrorSummary(
    validationErrors,
    errorHref,
  );

  return res.render('contract/about/about-supply-buyer.njk', {
    deal,
    validationErrors: formattedValidationErrors,
    countries: await getApiData(
      api.countries(userToken),
      res,
    ),
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

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const formattedValidationErrors = generateErrorSummary(
    validationErrors,
    errorHref,
  );

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

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
  const formattedValidationErrors = generateErrorSummary(
    validationErrors,
    errorHref,
  );

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  return res.render('contract/about/about-supply-preview.njk', { deal, validationErrors: formattedValidationErrors });
});


export default router;
