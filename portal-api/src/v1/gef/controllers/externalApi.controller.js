const axios = require('axios');
const { companiesHouseError } = require('./validation/external');
require('dotenv').config();
const { ERROR } = require('../enums');
const mapCompaniesHouseData = require('../mappings/map-companies-house-data');

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const findSicCodes = async (companySicCodes) => {
  const response = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/industry-sectors`,
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
      return res.status(422).send([{
        errCode: ERROR.MANDATORY_FIELD,
        errRef: 'regNumber',
        errMsg: 'Enter a Companies House registration number.',
      }]);
    }
    const response = await axios({
      method: 'get',
      url: `${referenceProxyUrl}/companies-house/${companyNumber}`,
    });

    if (response.data.type === 'oversea-company') {
      return res.status(422).send([{
        errCode: ERROR.OVERSEAS_COMPANY,
        errRef: 'regNumber',
        errMsg: 'UKEF can only process applications from companies based in the UK.',
      }]);
    }

    const industries = await findSicCodes(response.data.sic_codes);

    const mappedData = mapCompaniesHouseData(response.data, industries);

    return res.status(200).send(mappedData);
  } catch (err) {
    console.error('getByRegistrationNumber Error', err?.response?.data);
    const response = companiesHouseError(err);
    let { status } = err.response;
    if (response[0].errCode === 'company-profile-not-found') {
      status = 422;
    }
    return res.status(status).send(response);
  }
};

exports.getAddressesByPostcode = async (req, res) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${referenceProxyUrl}/ordnance-survey/${req.params.postcode}`,
    });
    const addresses = [];
    response.data.results.forEach((item) => {
      if (item.DPA.LANGUAGE === (req.query.language ? req.query.language : 'EN')) { // Ordance survey sends duplicated results with the welsh version too via 'CY'
        addresses.push({
          organisationName: item.DPA.ORGANISATION_NAME || null,
          addressLine1: (`${item.DPA.BUILDING_NAME || ''} ${item.DPA.BUILDING_NUMBER || ''} ${item.DPA.THOROUGHFARE_NAME || ''}`).trim(),
          addressLine2: item.DPA.DEPENDENT_LOCALITY || null,
          addressLine3: null, // keys to match registered Address as requested, but not available in OS Places
          locality: item.DPA.POST_TOWN || null,
          postalCode: item.DPA.POSTCODE || null,
          country: null, // keys to match registered Address as requested, but not available in OS Places
        });
      }
    });
    res.status(200).send(addresses);
  } catch (err) {
    const response = [{
      errCode: 'ERROR',
      errRef: 'postcode',
      errMsg: err?.response?.data?.error?.message || {},
    }];
    let { status } = err.response;
    if (status >= 400 && status < 500) {
      status = 422;
    }
    res.status(status).send(response);
  }
};
