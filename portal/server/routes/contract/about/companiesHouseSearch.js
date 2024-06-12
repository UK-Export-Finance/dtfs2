const express = require('express');
const { provide, DEAL, COUNTRIES } = require('../../api-data-provider');
const companiesApi = require('../../../companies-api');

// https://developer.companieshouse.gov.uk/api/docs/company/company_number/registered-office-address/registeredOfficeAddress-resource.html
// England, Wales, Scotland, Northern Ireland, Great Britain, United Kingdom, Not specified
const countriesThatWeConsiderGBR = ['England', 'Wales', 'Scotland', 'Northern Ireland', 'Great Britain', 'United Kingdom'];

const getPortalCountryForCompaniesHouseCountry = (companiesHouseCountry) => {
  if (countriesThatWeConsiderGBR.includes(companiesHouseCountry)) {
    return 'GBR';
  }
  return '';
};

const router = express.Router();

router.post('/contract/:_id/about/supplier/companies-house-search/:prefix', provide([DEAL, COUNTRIES]), async (req, res) => {
  const {
    session: { userToken },
    params: { prefix },
    apiData: { deal },
  } = req;

  const registrationNumberField = `${prefix}-companies-house-registration-number`;
  const registrationNumberFieldValue = req.body[registrationNumberField];

  const { company, errorMessage } = await companiesApi.getCompanyByRegistrationNumber(registrationNumberFieldValue, userToken);

  if (!company) {
    req.session.aboutSupplierFormData = deal;

    const companiesHouseValidationErrors = {
      count: 1,
      errorList: {
        [registrationNumberField]: {
          order: '1',
          text: errorMessage,
        },
      },
    };

    // add companies house validation error and submitted values to session
    // these can then be consumed in the GET route that we redirect to.
    req.session.companiesHouseSearchValidationErrors = companiesHouseValidationErrors;

    req.session.aboutSupplierFormData = {
      ...req.session.aboutSupplierFormData,
      submissionDetails: {
        ...deal.submissionDetails,
        ...req.body,
      },
    };

    return res.redirect(`/contract/${deal._id}/about/supplier`);
  }

  // munge data back into form data
  deal.submissionDetails = req.body;

  deal.submissionDetails[`${prefix}-name`] = company.companyName;
  deal.submissionDetails[`${prefix}-address-line-1`] = company.registeredAddress.addressLine1;
  deal.submissionDetails[`${prefix}-address-line-2`] = company.registeredAddress.addressLine2;
  deal.submissionDetails[`${prefix}-address-town`] = company.registeredAddress.locality;
  deal.submissionDetails[`${prefix}-address-postcode`] = company.registeredAddress.postalCode;

  deal.submissionDetails[`${prefix}-address-country`] = {
    code: getPortalCountryForCompaniesHouseCountry(company.registeredAddress.country),
  };

  const industry = company.industries[0];

  if (industry) {
    deal.submissionDetails['industry-sector'] = {
      code: industry.code,
      name: industry.name,
    };

    if (industry.class) {
      deal.submissionDetails['industry-class'] = {
        code: industry.class.code,
        name: industry.class.name,
      };
    }
  }

  req.session.aboutSupplierFormData = deal;

  const redirectUrl = `/contract/${deal._id}/about/supplier#${prefix}-companies-house-registration-number`;
  return res.redirect(redirectUrl);
});

module.exports = router;
