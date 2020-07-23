import express from 'express';
import companiesHouseAPI from '../../../companies-house-api';
import {
  mapCountries,
  mapIndustrySectors,
  mapIndustryClasses,
} from '../../../helpers';

import {
  provide, INDUSTRY_SECTORS, COUNTRIES,
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
  const sicCode = sicCodes[0];

  industrySectors.forEach((sector) => sector.classes.find((industryClass) => {
    if (industryClass.code === sicCode) {
      result = {
        industrySector: {
          code: sector.code,
          name: sector.name,
        },
        industryClass: {
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

router.post('/contract/:_id/about/supplier/companies-house-search/:prefix', provide([INDUSTRY_SECTORS, COUNTRIES]), async (req, res) => {
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
  deal.submissionDetails[`${prefix}-name`] = company.company_name;
  deal.submissionDetails[`${prefix}-address-line-1`] = company.registered_office_address.address_line_1;
  deal.submissionDetails[`${prefix}-address-line-2`] = company.registered_office_address.address_line_2;
  deal.submissionDetails[`${prefix}-address-town`] = company.registered_office_address.locality;
  deal.submissionDetails[`${prefix}-address-postcode`] = company.registered_office_address.postal_code;
  deal.submissionDetails[`${prefix}-address-country`] = getPortalCountryForCompaniesHouseCountry(company.registered_office_address.country);

  const { industrySector, industryClass } = getIndustryFromSicCode(industrySectors, company.sic_codes);

  // re-render
  const mappedIndustrySectors = mapIndustrySectors(industrySectors, industrySector.code);
  const mappedIndustryClasses = mapIndustryClasses(industrySectors, industrySector.code, industryClass.code);
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

export default router;
