const axios = require('axios');
const { companiesHouseError } = require('./validation/external');
const { isValidRegex, isValidCompaniesHouseNumber } = require('../../validation/validateIds');
const { UK_POSTCODE } = require('../../../constants/regex');

require('dotenv').config();
const { ERROR } = require('../enums');
const mapCompaniesHouseData = require('../mappings/map-companies-house-data');
const externalApi = require('../../../external-api/api');

const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': EXTERNAL_API_KEY,
};

const findSicCodes = async (companySicCodes) => {
  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/industry-sectors`,
    headers,
  });

  if (companySicCodes && response && response.data) {
    const industries = [];
    companySicCodes.forEach((companySicCode) => {
      response.data.industrySectors.forEach((industrySector) => {
        industrySector.classes.forEach((industryClass) => {
          if (industryClass.code === companySicCode) {
            industries.push({ code: industrySector.code, name: industrySector.name, class: industryClass });
          }
        });
      });
    });
    return industries;
  }
  return null;
};

exports.getByRegistrationNumber = async (req, res) => {
  try {
    const companyNumber = req.params.number;

    if (!companyNumber || companyNumber === '') {
      return res.status(422).send([
        {
          status: 422,
          errCode: ERROR.MANDATORY_FIELD,
          errRef: 'regNumber',
          errMsg: 'Enter a Companies House registration number.',
        },
      ]);
    }

    if (!isValidCompaniesHouseNumber(companyNumber)) {
      console.error('Get company house information API failed for companyNumber %o', companyNumber);
      // returns invalid companies house registration number error
      return res.status(400).send([
        {
          status: 400,
          errCode: 'company-profile-not-found',
          errRef: 'regNumber',
          errMsg: 'Invalid Companies House registration number',
        },
      ]);
    }

    const response = await externalApi.companiesHouse.getCompanyProfileByCompanyRegistrationNumber(companyNumber);

    if (response.data.type === 'oversea-company') {
      return res.status(422).send([
        {
          status: 422,
          errCode: ERROR.OVERSEAS_COMPANY,
          errRef: 'regNumber',
          errMsg: 'UKEF can only process applications from companies based in the UK.',
        },
      ]);
    }

    const industries = await findSicCodes(response.data.sic_codes);

    const mappedData = mapCompaniesHouseData(response.data, industries);

    return res.status(200).send(mappedData);
  } catch (error) {
    console.error('getByRegistrationNumber Error %o', error?.response?.data);
    const { status, response } = companiesHouseError(error);
    return res.status(status).send(response);
  }
};

exports.getAddressesByPostcode = async (req, res) => {
  try {
    const { postcode } = req.params;

    if (!isValidRegex(UK_POSTCODE, postcode)) {
      console.error('Get addresses by postcode failed for postcode %o', postcode);
      return res.status(400).send([
        {
          status: 400,
          errCode: 'ERROR',
          errRef: 'postcode',
          errMsg: 'Invalid postcode',
        },
      ]);
    }

    const response = await externalApi.ordnanceSurvey.getAddressesByPostcode(postcode);

    const addresses = [];

    if (!response?.data?.results) {
      return res.status(422).send([
        {
          status: 422,
          errCode: 'ERROR',

          errRef: 'postcode',
        },
      ]);
    }
    response.data.results.forEach((item) => {
      if (item.DPA.LANGUAGE === (req.query.language ? req.query.language : 'EN')) {
        // Ordnance survey sends duplicated results with the welsh version too via 'CY'

        addresses.push({
          organisationName: item.DPA.ORGANISATION_NAME || null,
          addressLine1: `${item.DPA.BUILDING_NAME || ''} ${item.DPA.BUILDING_NUMBER || ''} ${item.DPA.THOROUGHFARE_NAME || ''}`.trim(),
          addressLine2: item.DPA.DEPENDENT_LOCALITY || null,
          addressLine3: null, // keys to match registered Address as requested, but not available in OS Places
          locality: item.DPA.POST_TOWN || null,
          postalCode: item.DPA.POSTCODE || null,
          country: null, // keys to match registered Address as requested, but not available in OS Places
        });
      }
    });

    return res.status(200).send(addresses);
  } catch (error) {
    let { status } = error.response;
    if (status >= 400 && status < 500) {
      status = 422;
    }
    const response = [
      {
        status,
        errCode: 'ERROR',
        errRef: 'postcode',
        errMsg: error?.response?.data?.error?.message || {},
      },
    ];
    return res.status(status).send(response);
  }
};
