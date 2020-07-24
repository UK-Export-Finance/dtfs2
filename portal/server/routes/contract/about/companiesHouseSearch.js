import express from 'express';
import companiesHouseAPI from '../../../companies-house-api';
import {
  provide, INDUSTRY_SECTORS,
} from '../../api-data-provider';

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

router.post('/contract/:_id/about/supplier/companies-house-search/:prefix', provide([INDUSTRY_SECTORS]), async (req, res) => {
  const { prefix } = req.params;
  const { deal, industrySectors } = req.apiData;

  const searchTerm = `${prefix}-companies-house-registration-number`;
  const company = await companiesHouseAPI.getByRegistrationNumber(req.body[searchTerm]);

  deal.submissionDetails = req.body;

  if (!company) {
    req.session.aboutSupplierFormData = deal;
    return res.redirect(`/contract/${deal._id}/about/supplier`); // eslint-disable-line no-underscore-dangle
  }

  // munge data back into form data
  deal.submissionDetails[`${prefix}-name`] = company.company_name;
  deal.submissionDetails[`${prefix}-address-line-1`] = company.registered_office_address.address_line_1;
  deal.submissionDetails[`${prefix}-address-line-2`] = company.registered_office_address.address_line_2;
  deal.submissionDetails[`${prefix}-address-town`] = company.registered_office_address.locality;
  deal.submissionDetails[`${prefix}-address-postcode`] = company.registered_office_address.postal_code;
  deal.submissionDetails[`${prefix}-address-country`] = getPortalCountryForCompaniesHouseCountry(company.registered_office_address.country);

  const industryFromSicCode = getIndustryFromSicCode(industrySectors, company.sic_codes);

  if (industryFromSicCode) {
    if (industryFromSicCode.sector) {
      deal.submissionDetails['industry-sector'] = industryFromSicCode.sector.code;
    }

    if (industryFromSicCode.class) {
      deal.submissionDetails['industry-class'] = industryFromSicCode.class.code;
    }
  }

  req.session.aboutSupplierFormData = deal;
  const redirectUrl = `/contract/${deal._id}/about/supplier#${prefix}-companies-house-registration-number`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

export default router;
