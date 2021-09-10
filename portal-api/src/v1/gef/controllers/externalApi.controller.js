const axios = require('axios');
const { ObjectID } = require('bson');
const db = require('../../../drivers/db-client');
const { companiesHouseError } = require('./validation/external');
require('dotenv').config();
const { ERROR } = require('../enums');

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const collectionName = 'gef-exporter';

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
  const collection = await db.getCollection(collectionName);
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

    if (req.query.exporterId) {
      const industries = await findSicCodes(response.data.sic_codes);
      let selectedIndustry = null;
      if (industries && industries.length === 1) {
        // eslint-disable-next-line prefer-destructuring
        selectedIndustry = industries[0];
      }
      const address = response.data.registered_office_address;
      await collection.findOneAndUpdate(
        { _id: { $eq: ObjectID(String(req.query.exporterId)) } }, {
          $set: {
            companiesHouseRegistrationNumber: response.data.company_number,
            companyName: response.data.company_name,
            registeredAddress: {
              organisationName: address.organisation_name,
              addressLine1: address.address_line_1,
              addressLine2: address.address_line_2,
              addressLine3: address.address_line_3,
              locality: address.locality,
              postalCode: address.postal_code,
              country: address.country,
            },
            updatedAt: Date.now(),
            selectedIndustry,
            industries,
          },
        }, { returnDocument: 'after', returnOriginal: false },
      );
    }
    return res.status(200).send(response.data);
  } catch (err) {
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
      errMsg: err.response.data.error.message,
    }];
    let { status } = err.response;
    if (status >= 400 && status < 500) {
      status = 422;
    }
    res.status(status).send(response);
  }
};
