const express = require('express');
const companiesHouseAPI = require('../../../companies-house-api');
const {
  provide,
  DEAL,
  INDUSTRY_SECTORS,
  COUNTRIES,
} = require('../../api-data-provider');

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

const getIndustryFromSicCode = (industrySectors, sicCodes) => {
  let result = {};
  if (!sicCodes) {
    return null;
  }

  const sicCode = sicCodes[0];

  industrySectors.forEach((sector) => sector.classes.find((industryClass) => {
    if (industryClass.code === sicCode) {
      result = {
        sector: {
          code: sector.code,
          name: sector.name,
        },
        class: {
          code: industryClass.code,
          name: industryClass.name,
        },
      };
      return result;
    }
    return null;
  }));

  return result;
};

router.post('/contract/:_id/about/supplier/companies-house-search/:prefix', provide([DEAL, INDUSTRY_SECTORS, COUNTRIES]), async (req, res) => {
  const { prefix } = req.params;
  const { deal, industrySectors } = req.apiData;

  const registrationNumberField = `${prefix}-companies-house-registration-number`;
  const registrationNumberFieldValue = req.body[registrationNumberField];

  const { company, errorMessage } = await companiesHouseAPI.getByRegistrationNumber(registrationNumberFieldValue);

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

  deal.submissionDetails[`${prefix}-name`] = company.company_name;
  deal.submissionDetails[`${prefix}-address-line-1`] = company.registered_office_address.address_line_1;
  deal.submissionDetails[`${prefix}-address-line-2`] = company.registered_office_address.address_line_2;
  deal.submissionDetails[`${prefix}-address-town`] = company.registered_office_address.locality;
  deal.submissionDetails[`${prefix}-address-postcode`] = company.registered_office_address.postal_code;

  deal.submissionDetails[`${prefix}-address-country`] = {
    code: getPortalCountryForCompaniesHouseCountry(company.registered_office_address.country),
  };

  const industryFromSicCode = getIndustryFromSicCode(industrySectors, company.sic_codes);

  if (industryFromSicCode) {
    if (industryFromSicCode.sector) {
      deal.submissionDetails['industry-sector'] = {
        code: industryFromSicCode.sector.code,
        name: industryFromSicCode.sector.name,
      };
    }

    if (industryFromSicCode.class) {
      deal.submissionDetails['industry-class'] = {
        code: industryFromSicCode.class.code,
        name: industryFromSicCode.class.name,
      };
    }
  }

  req.session.aboutSupplierFormData = deal;

  const redirectUrl = `/contract/${deal._id}/about/supplier#${prefix}-companies-house-registration-number`;
  return res.redirect(redirectUrl);
});

module.exports = router;
